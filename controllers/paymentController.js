const { Payment, Ticket, Trip, Line, Station, User, Train, sequelize } = require("../models");

// تأكيد أن المفتاح موجود
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("❌ STRIPE_SECRET_KEY is missing from your .env file");
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const QRCode = require("qrcode");

// ----------------------------
// 1) إنشاء جلسة الدفع
// ----------------------------
exports.createPaymentSession = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user_id = req.user.id;
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ message: "معرّف التذكرة مطلوب" });
    }

    const ticket = await Ticket.findByPk(ticket_id, {
      include: [
        { model: Trip, include: [{ model: Line }] },
        { model: Station, as: "from_station", attributes: ["name"] },
        { model: Station, as: "to_station", attributes: ["name"] },
      ],
      transaction,
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ message: "التذكرة غير موجودة" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Metro Ticket - ${ticket.from_station.name} → ${ticket.to_station.name}`,
            },
            unit_amount: Math.round(ticket.total_price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&ticket_id=${ticket.id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    await Payment.create(
      {
        amount: ticket.total_price,
        status: "pending",
        stripe_payment_intent_id: session.payment_intent,
        ticket_id: ticket.id,
        user_id: user_id,
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Stripe Error:", err);
    res.status(500).json({
      message: "خطأ في إنشاء جلسة الدفع",
      error: err.message,
    });
  }
};

// ----------------------------
// 2) تأكيد الدفع
// ----------------------------
exports.confirmPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { session_id } = req.body;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      await transaction.rollback();
      return res.status(400).json({ message: "الدفع لم يتم بعد" });
    }

    const payment = await Payment.findOne({
      where: { stripe_payment_intent_id: session.payment_intent },
      transaction,
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({ message: "لم يتم العثور على الدفع" });
    }

    await payment.update(
      {
        status: "completed",
        timestamp: new Date(),
      },
      { transaction }
    );

    const ticket = await Ticket.findByPk(payment.ticket_id, { transaction });

    const qrData = JSON.stringify({
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    await ticket.update(
      {
        status: "confirmed",
        qr_code: qrCode,
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: "تم الدفع وتأكيد الحجز",
      ticket_id: ticket.id,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Confirm Payment Error:", err);
    res.status(500).json({
      message: "خطأ في تأكيد الدفع",
      error: err.message,
    });
  }
};

// ----------------------------
// 3) التحقق من حالة الدفع
// ----------------------------
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      payment_status: session.payment_status,
      amount_total: session.amount_total / 100,
    });
  } catch (err) {
    console.error("Check Payment Error:", err);
    res.status(500).json({
      message: "خطأ في التحقق من حالة الدفع",
      error: err.message,
    });
  }
};
