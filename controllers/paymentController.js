// const { Payment, Ticket, Trip, Line, Station, User, Train, sequelize } = require("../models");

// // 🔴 **تأكد أن المفاتيح موجودة في .env**
// // STRIPE_SECRET_KEY=sk_test_....
// // STRIPE_PUBLISHABLE_KEY=pk_test_....
// const stripe = require("stripe")("sk_test_51SYaII0tdt1GhMNgosg1pmOaGp4qSqkH0U8Xje2OQQhIxNJbc9OLijlDpPnDhWQBop4GII7dRhfNEb2XStTTz5xx00AQYnEF03");
// const QRCode = require("qrcode");

// // ✅ **1. إنشاء جلسة دفع Stripe (كما في الصورة)**
// exports.createStripePaymentSession = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const user_id = req.user.id;
//     const { ticket_id, periodic_ticket_number } = req.body;

//     // 🔴 **التحقق: إما ticket_id أو periodic_ticket_number**
//     if (!ticket_id && !periodic_ticket_number) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         message: "مطلوب: إما ticket_id لتذكرة عادية أو periodic_ticket_number لتذكرة دورية" 
//       });
//     }

//     let ticket;
//     let isPeriodic = false;
//     let tickets = [];

//     // 🔴 **الحالة 1: تذكرة دورية (Weekly/Monthly)**
//     if (periodic_ticket_number) {
//       tickets = await Ticket.findAll({
//         where: {
//           periodic_ticket_number: periodic_ticket_number,
//           status: 'pending'
//         },
//         include: [
//           { 
//             model: Trip, 
//             include: [{ model: Line }] 
//           },
//           { 
//             model: Station, 
//             as: "from_station", 
//             attributes: ["name", "id"] 
//           },
//           { 
//             model: Station, 
//             as: "to_station", 
//             attributes: ["name", "id"] 
//           },
//         ],
//         transaction,
//       });

//       if (tickets.length === 0) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "لم يتم العثور على تذاكر دورية قيد الانتظار" });
//       }

//       ticket = tickets[0];
//       isPeriodic = true;
//     } 
//     // 🔴 **الحالة 2: تذكرة عادية**
//     else {
//       ticket = await Ticket.findByPk(ticket_id, {
//         include: [
//           { 
//             model: Trip, 
//             include: [{ model: Line }] 
//           },
//           { 
//             model: Station, 
//             as: "from_station", 
//             attributes: ["name", "id"] 
//           },
//           { 
//             model: Station, 
//             as: "to_station", 
//             attributes: ["name", "id"] 
//           },
//         ],
//         transaction,
//       });

//       if (!ticket) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "التذكرة غير موجودة" });
//       }
//     }

//     const user = await User.findByPk(user_id, { transaction });
//     if (!user) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "المستخدم غير موجود" });
//     }

//     // 🔴 **بناء وصف الدفع**
//     const description = isPeriodic 
//       ? `تذكرة ${ticket.discount_type === 'weekly' ? 'أسبوعية' : 'شهرية'} - ${ticket.from_station.name} → ${ticket.to_station.name}`
//       : `تذكرة مترو - ${ticket.from_station.name} → ${ticket.to_station.name}`;

//     // 🔴 **إنشاء جلسة Stripe Checkout (كما في الصورة)**
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: isPeriodic 
//                 ? `Metro Periodic Ticket (${ticket.discount_type})`
//                 : "Metro Single Ticket",
//               description: description,
//               images: ["https://example.com/metro-logo.png"], // ضع رابط لوجو المترو
//             },
//             unit_amount: Math.round(ticket.total_price * 100), // تحويل الدولار إلى سنت
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       customer_email: user.email || "user@example.com", // من بيانات المستخدم
      
//       // 🔴 **معلومات الشحن (كما في الصورة)**
//       shipping_address_collection: {
//         allowed_countries: ["US", "IQ", "SA", "AE", "JO", "EG"], // دول مسموح بها
//       },
      
//       // 🔴 **إضافة معلومات مخصصة (للتتبع)**
//       metadata: {
//         user_id: user_id.toString(),
//         ticket_id: ticket.id.toString(),
//         ticket_type: isPeriodic ? "periodic" : "single",
//         periodic_ticket_number: periodic_ticket_number || "none",
//       },
      
//       // 🔴 **عنوان النجاح والإلغاء**
//       success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      
//       // 🔴 **تخصيص نموذج الدفع**
//       custom_text: {
//         submit: {
//           message: "سيتم تفعيل التذكرة فور اكتمال الدفع", // رسالة تأكيد
//         },
//         shipping_address: {
//           message: "يرجى إدخال عنوان الشحن (اختياري)", // رسالة العنوان
//         },
//       },
//     });

//     // 🔴 **تسجيل عملية الدفع في قاعدة البيانات**
//     if (isPeriodic) {
//       // للتذاكر الدورية: سجل دفعة واحدة لجميع التذاكر
//       await Payment.create(
//         {
//           amount: ticket.total_price * tickets.length,
//           status: "pending",
//           stripe_session_id: session.id,
//           stripe_payment_intent_id: session.payment_intent,
//           ticket_id: ticket.id, // أول تذكرة فقط كمرجع
//           user_id: user_id,
//           customer_name: user.username || user.full_name,
//           payment_method: "card",
//         },
//         { transaction }
//       );
//     } else {
//       // للتذاكر العادية
//       await Payment.create(
//         {
//           amount: ticket.total_price,
//           status: "pending",
//           stripe_session_id: session.id,
//           stripe_payment_intent_id: session.payment_intent,
//           ticket_id: ticket.id,
//           user_id: user_id,
//           customer_name: user.username || user.full_name,
//           payment_method: "card",
//         },
//         { transaction }
//       );
//     }

//     await transaction.commit();

//     // 🔴 **إرجاع رابط الدفع (يجب توجيه المستخدم إليه في الفرونت إند)**
//     res.json({
//       success: true,
//       message: "تم إنشاء جلسة الدفع بنجاح",
//       sessionId: session.id,
//       paymentUrl: session.url, // 🔴 هذا الرابط يفتح صفحة الدفع كما في الصورة
//       details: {
//         amount: ticket.total_price,
//         currency: "USD",
//         description: description,
//         is_periodic: isPeriodic,
//         tickets_count: isPeriodic ? tickets.length : 1,
//       }
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Stripe Session Creation Error:", err);
//     res.status(500).json({
//       message: "خطأ في إنشاء جلسة الدفع",
//       error: err.message,
//     });
//   }
// };

// // ✅ **2. Webhook لاستقبال تأكيد الدفع من Stripe (مهم جداً)**
// exports.stripeWebhook = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const transaction = await sequelize.transaction();

//   try {
//     let event;
    
//     // 🔴 **التحقق من التوقيع (يجب إضافة STRIPE_WEBHOOK_SECRET في .env)**
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // 🔴 **معالجة الحدث**
//     switch (event.type) {
//       case 'checkout.session.completed':
//         const session = event.data.object;
        
//         // 🔴 **البحث عن الدفع بواسطة session_id**
//         const payment = await Payment.findOne({
//           where: { stripe_session_id: session.id },
//           transaction,
//         });

//         if (!payment) {
//           console.error("Payment not found for session:", session.id);
//           await transaction.rollback();
//           return res.status(404).json({ message: "لم يتم العثور على الدفع" });
//         }

//         // 🔴 **تحديث معلومات الدفع (من بيانات Stripe)**
//         await payment.update({
//           status: "completed",
//           timestamp: new Date(),
//           customer_name: session.customer_details?.name || "غير معروف",
//           country: session.customer_details?.address?.country || "غير معروف",
//           address: session.customer_details?.address?.line1 || "غير معروف",
//           card_number_last4: session.payment_method_details?.card?.last4 || "0000",
//           card_exp_month: session.payment_method_details?.card?.exp_month || 0,
//           card_exp_year: session.payment_method_details?.card?.exp_year || 0,
//           card_brand: session.payment_method_details?.card?.brand || "unknown",
//         }, { transaction });

//         // 🔴 **تحديث حالة التذكرة/التذاكر**
//         const ticket = await Ticket.findByPk(payment.ticket_id, { transaction });
        
//         if (ticket) {
//           // 🔴 **فحص إذا كانت تذكرة دورية**
//           if (ticket.is_periodic_ticket && ticket.periodic_ticket_number) {
//             // 🔴 **تحديث جميع التذاكر الدورية**
//             const allTickets = await Ticket.findAll({
//               where: {
//                 periodic_ticket_number: ticket.periodic_ticket_number,
//                 status: 'pending'
//               },
//               transaction,
//             });

//             for (const t of allTickets) {
//               // 🔴 **إنشاء QR Code لكل تذكرة**
//               const qrData = JSON.stringify({
//                 ticket_id: t.id,
//                 ticket_number: t.ticket_number,
//                 user_id: t.user_id,
//                 from_station_id: t.from_station_id,
//                 to_station_id: t.to_station_id,
//                 trip_date: t.periodic_start_date,
//                 discount_type: t.discount_type,
//               });

//               const qrCode = await QRCode.toDataURL(qrData);

//               await t.update({
//                 status: "confirmed",
//                 qr_code: qrCode,
//                 payment_reference: session.payment_intent,
//                 confirmed_at: new Date(),
//               }, { transaction });
//             }

//             console.log(`✅ تم تأكيد ${allTickets.length} تذكرة دورية`);
//           } else {
//             // 🔴 **تذكرة عادية**
//             const qrData = JSON.stringify({
//               ticket_id: ticket.id,
//               ticket_number: ticket.ticket_number,
//             });

//             const qrCode = await QRCode.toDataURL(qrData);

//             await ticket.update({
//               status: "confirmed",
//               qr_code: qrCode,
//               payment_reference: session.payment_intent,
//               confirmed_at: new Date(),
//             }, { transaction });
//           }
//         }

//         await transaction.commit();
//         console.log(`✅ تم تأكيد الدفع لـ session: ${session.id}`);
//         break;

//       case 'checkout.session.expired':
//         const expiredSession = event.data.object;
        
//         await Payment.update(
//           { status: "failed" },
//           { 
//             where: { stripe_session_id: expiredSession.id },
//             transaction 
//           }
//         );
        
//         await transaction.commit();
//         console.log(`❌ انتهت صلاحية جلسة الدفع: ${expiredSession.id}`);
//         break;

//       default:
//         console.log(`ℹ️ حدث غير معالج: ${event.type}`);
//     }

//     res.json({ received: true });
    
//   } catch (err) {
//     await transaction.rollback();
//     console.error("Webhook Error:", err);
//     res.status(500).json({
//       message: "خطأ في معالجة webhook",
//       error: err.message,
//     });
//   }
// };

// // ✅ **3. تحويل العملة (من IQD إلى USD)**
// exports.convertCurrency = async (req, res) => {
//   try {
//     const { amount_iqd } = req.body;
    
//     if (!amount_iqd || isNaN(amount_iqd)) {
//       return res.status(400).json({ message: "المبلغ بالدينار العراقي مطلوب" });
//     }

//     // 🔴 **سعر التحويل (يمكن جعله ديناميكي من API)**
//     const exchangeRate = 1460; // 1 دولار = 1460 دينار عراقي (تقريبي)
//     const amount_usd = amount_iqd / exchangeRate;

//     res.json({
//       success: true,
//       conversion: {
//         amount_iqd: parseFloat(amount_iqd).toFixed(2),
//         amount_usd: amount_usd.toFixed(2),
//         exchange_rate: exchangeRate,
//         currency_iqd: "IQD",
//         currency_usd: "USD"
//       }
//     });
//   } catch (err) {
//     console.error("Currency Conversion Error:", err);
//     res.status(500).json({
//       message: "خطأ في تحويل العملة",
//       error: err.message,
//     });
//   }
// };

// // ✅ **4. الحصول على تفاصيل الدفع**
// exports.getPaymentDetails = async (req, res) => {
//   try {
//     const { session_id } = req.query;

//     if (!session_id) {
//       return res.status(400).json({ message: "معرف الجلسة مطلوب" });
//     }

//     const session = await stripe.checkout.sessions.retrieve(session_id, {
//       expand: ['payment_intent', 'customer', 'line_items']
//     });

//     const payment = await Payment.findOne({
//       where: { stripe_session_id: session_id },
//       include: [
//         {
//           model: Ticket,
//           include: [
//             { model: Trip, include: [{ model: Line }] },
//             { model: Station, as: "from_station" },
//             { model: Station, as: "to_station" },
//           ]
//         },
//         { model: User, attributes: ['id', 'username', 'email'] }
//       ]
//     });

//     res.json({
//       success: true,
//       payment_status: session.payment_status,
//       session_details: {
//         id: session.id,
//         amount_total: session.amount_total / 100,
//         currency: session.currency,
//         customer_email: session.customer_details?.email,
//         customer_name: session.customer_details?.name,
//         shipping_address: session.customer_details?.address,
//       },
//       payment_record: payment,
//       ticket_details: payment?.Ticket
//     });
//   } catch (err) {
//     console.error("Get Payment Details Error:", err);
//     res.status(500).json({
//       message: "خطأ في جلب تفاصيل الدفع",
//       error: err.message,
//     });
//   }
// };

// // ✅ **5. اختبار دفع وهمي (للتطوير)**
// exports.createMockPayment = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { ticket_id, periodic_ticket_number } = req.body;
//     const user_id = req.user.id;

//     let ticket;
//     let tickets = [];
//     let isPeriodic = false;

//     // 🔴 **البحث عن التذكرة**
//     if (periodic_ticket_number) {
//       tickets = await Ticket.findAll({
//         where: {
//           periodic_ticket_number: periodic_ticket_number,
//           status: 'pending'
//         },
//         transaction,
//       });

//       if (tickets.length === 0) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "لم يتم العثور على تذاكر دورية" });
//       }

//       ticket = tickets[0];
//       isPeriodic = true;
//     } else {
//       ticket = await Ticket.findByPk(ticket_id, { transaction });
      
//       if (!ticket) {
//         await transaction.rollback();
//         return res.status(404).json({ message: "التذكرة غير موجودة" });
//       }
//     }

//     // 🔴 **إنشاء دفع وهمي (للتطوير فقط)**
//     const mockPayment = await Payment.create({
//       amount: isPeriodic ? ticket.total_price * tickets.length : ticket.total_price,
//       status: "completed",
//       stripe_session_id: `mock_session_${Date.now()}`,
//       stripe_payment_intent_id: `mock_pi_${Date.now()}`,
//       ticket_id: ticket.id,
//       user_id: user_id,
//       customer_name: "Test Customer",
//       country: "Iraq",
//       address: "Test Address, Baghdad",
//       card_number_last4: "4242",
//       card_exp_month: 12,
//       card_exp_year: 2025,
//       card_brand: "visa",
//       payment_method: "card",
//       timestamp: new Date(),
//     }, { transaction });

//     // 🔴 **تأكيد التذاكر**
//     if (isPeriodic) {
//       for (const t of tickets) {
//         const qrData = JSON.stringify({
//           ticket_id: t.id,
//           ticket_number: t.ticket_number,
//           user_id: t.user_id,
//           from_station_id: t.from_station_id,
//           to_station_id: t.to_station_id,
//         });

//         const qrCode = await QRCode.toDataURL(qrData);

//         await t.update({
//           status: "confirmed",
//           qr_code: qrCode,
//           payment_reference: mockPayment.stripe_payment_intent_id,
//           confirmed_at: new Date(),
//         }, { transaction });
//       }
//     } else {
//       const qrData = JSON.stringify({
//         ticket_id: ticket.id,
//         ticket_number: ticket.ticket_number,
//       });

//       const qrCode = await QRCode.toDataURL(qrData);

//       await ticket.update({
//         status: "confirmed",
//         qr_code: qrCode,
//         payment_reference: mockPayment.stripe_payment_intent_id,
//         confirmed_at: new Date(),
//       }, { transaction });
//     }

//     await transaction.commit();

//     res.json({
//       success: true,
//       message: "تم محاكاة الدفع بنجاح (وهمي)",
//       payment_id: mockPayment.id,
//       tickets_updated: isPeriodic ? tickets.length : 1,
//       qr_codes_generated: true,
//       note: "هذه وظيفة للتطوير فقط، لا تستخدم في الإنتاج"
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("Mock Payment Error:", err);
//     res.status(500).json({
//       message: "خطأ في محاكاة الدفع",
//       error: err.message,
//     });
//   }
// };



const { Payment, Ticket, Trip, Line, Station, User, Train, sequelize } = require("../models");
const QRCode = require("qrcode");

// 🔴 **استخدام Stripe test key عام (يعمل 100%)**
const stripe = require("stripe")("sk_test_51SYaII0tdt1GhMNgosg1pmOaGp4qSqkH0U8Xje2OQQhIxNJbc9OLijlDpPnDhWQBop4GII7dRhfNEb2XStTTz5xx00AQYnEF03");

// ✅ **1. إنشاء جلسة دفع Stripe**
exports.createStripePaymentSession = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log("🎯 بدء إنشاء جلسة دفع Stripe...");
    
    const user_id = req.user.id;
    const { ticket_id, periodic_ticket_number } = req.body;

    // 🔴 **التحقق: إما ticket_id أو periodic_ticket_number**
    if (!ticket_id && !periodic_ticket_number) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "مطلوب: إما ticket_id لتذكرة عادية أو periodic_ticket_number لتذكرة دورية" 
      });
    }

    let ticket;
    let isPeriodic = false;
    let tickets = [];

    // 🔴 **الحالة 1: تذكرة دورية (Weekly/Monthly)**
    if (periodic_ticket_number) {
      console.log(`🔍 البحث عن تذاكر دورية: ${periodic_ticket_number}`);
      
      tickets = await Ticket.findAll({
        where: {
          periodic_ticket_number: periodic_ticket_number,
          status: 'pending'
        },
        include: [
          { 
            model: Trip, 
            include: [{ model: Line }] 
          },
          { 
            model: Station, 
            as: "from_station", 
            attributes: ["name", "id"] 
          },
          { 
            model: Station, 
            as: "to_station", 
            attributes: ["name", "id"] 
          },
        ],
        transaction,
      });

      if (tickets.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: "لم يتم العثور على تذاكر دورية قيد الانتظار",
          periodic_ticket_number 
        });
      }

      ticket = tickets[0];
      isPeriodic = true;
      console.log(`✅ تم العثور على ${tickets.length} تذكرة دورية`);
    } 
    // 🔴 **الحالة 2: تذكرة عادية**
    else {
      console.log(`🔍 البحث عن تذكرة عادية: ${ticket_id}`);
      
      ticket = await Ticket.findByPk(ticket_id, {
        include: [
          { 
            model: Trip, 
            include: [{ model: Line }] 
          },
          { 
            model: Station, 
            as: "from_station", 
            attributes: ["name", "id"] 
          },
          { 
            model: Station, 
            as: "to_station", 
            attributes: ["name", "id"] 
          },
        ],
        transaction,
      });

      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: "التذكرة غير موجودة",
          ticket_id 
        });
      }
      console.log("✅ تم العثور على التذكرة العادية");
    }

    // 🔴 **البحث عن المستخدم**
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // 🔴 **بناء وصف الدفع**
    const description = isPeriodic 
      ? `تذكرة ${ticket.discount_type === 'weekly' ? 'أسبوعية' : 'شهرية'} - ${ticket.from_station.name} → ${ticket.to_station.name}`
      : `تذكرة مترو - ${ticket.from_station.name} → ${ticket.to_station.name}`;

    console.log(`💰 المبلغ: ${ticket.total_price} | النوع: ${isPeriodic ? 'دورية' : 'عادية'}`);

    // 🔴 **إنشاء جلسة Stripe Checkout (تطوير)**
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isPeriodic 
                ? `Metro Periodic Ticket (${ticket.discount_type})`
                : "Metro Single Ticket",
              description: description,
              images: ["https://cdn-icons-png.flaticon.com/512/3097/3097140.png"],
            },
            unit_amount: Math.round(ticket.total_price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user.email || "user@example.com",
      
      // 🔴 **معلومات الشحن (اختيارية)**
      shipping_address_collection: {
        allowed_countries: ["US", "IQ", "SA", "AE", "JO", "EG"],
      },
      
      // 🔴 **معلومات التتبع**
      metadata: {
        user_id: user_id.toString(),
        ticket_id: ticket.id.toString(),
        ticket_type: isPeriodic ? "periodic" : "single",
        periodic_ticket_number: periodic_ticket_number || "none",
        project: "metro_graduation_project"
      },
      
      // 🔴 **عنوان النجاح والإلغاء (تطوير)**
      success_url: `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}&ticket_number=${ticket.ticket_number}`,
      cancel_url: `http://localhost:3000/payment/cancel`,
      
      // 🔴 **تخصيص رسائل الدفع**
      custom_text: {
        submit: {
          message: "سيتم تفعيل التذكرة فور اكتمال الدفع",
        },
        shipping_address: {
          message: "يرجى إدخال عنوان الشحن (اختياري للاختبار)",
        },
      },
    });

    console.log(`✅ تم إنشاء Stripe session: ${session.id}`);

    // 🔴 **تسجيل عملية الدفع في قاعدة البيانات**
    if (isPeriodic) {
      // للتذاكر الدورية
      await Payment.create(
        {
          amount: ticket.total_price * tickets.length,
          status: "pending",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          ticket_id: ticket.id,
          user_id: user_id,
          customer_name: user.username || user.full_name || "Customer",
          payment_method: "card",
          timestamp: new Date()
        },
        { transaction }
      );
      console.log(`💰 تم تسجيل دفعة دورية بقيمة: ${ticket.total_price * tickets.length}`);
    } else {
      // للتذاكر العادية
      await Payment.create(
        {
          amount: ticket.total_price,
          status: "pending",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          ticket_id: ticket.id,
          user_id: user_id,
          customer_name: user.username || user.full_name || "Customer",
          payment_method: "card",
          timestamp: new Date()
        },
        { transaction }
      );
      console.log(`💰 تم تسجيل دفعة عادية بقيمة: ${ticket.total_price}`);
    }

    await transaction.commit();

    // 🔴 **إرجاع رابط الدفع**
    res.json({
      success: true,
      message: "تم إنشاء جلسة الدفع بنجاح",
      sessionId: session.id,
      paymentUrl: session.url,
      details: {
        amount: ticket.total_price,
        currency: "USD",
        description: description,
        is_periodic: isPeriodic,
        tickets_count: isPeriodic ? tickets.length : 1,
        test_mode: true,
        test_card: "4242 4242 4242 4242"
      },
      instructions: {
        arabic: "استخدم بطاقة الاختبار: 4242 4242 4242 4242",
        english: "Use test card: 4242 4242 4242 4242"
      }
    });

  } catch (err) {
    await transaction.rollback();
    
    console.error("❌ خطأ في إنشاء جلسة الدفع:");
    console.error("📌 الرسالة:", err.message);
    console.error("📌 النوع:", err.type);
    
    // رسالة توضيحية للمستخدم
    let userMessage = "خطأ في إنشاء جلسة الدفع";
    if (err.type === 'StripeInvalidRequestError') {
      userMessage = "مشكلة في إعدادات Stripe. جرب الدفع الوهمي للتطوير.";
    } else if (err.message.includes('API')) {
      userMessage = "مشكلة في اتصال Stripe. تأكد من المفاتيح.";
    }
    
    res.status(500).json({
      message: userMessage,
      error: err.message,
      type: err.type,
      alternative: "استخدم /api/payments/mock-payment للتطوير"
    });
  }
};

// ✅ **2. Webhook لاستقبال تأكيد الدفع من Stripe**
exports.stripeWebhook = async (req, res) => {
  console.log("🔔 استقبال Webhook من Stripe...");
  
  // للاختبار: إذا ما كان في توقيع، معالجة كـ test event
  if (!req.headers['stripe-signature']) {
    console.log("⚠️ Webhook بدون توقيع - معالجة كحدث اختبار");
    return handleTestWebhook(req, res);
  }

  const sig = req.headers['stripe-signature'];
  const transaction = await sequelize.transaction();

  try {
    let event;
    
    // 🔴 **التحقق من التوقيع**
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error("❌ فشل التحقق من توقيع Webhook:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 🔴 **معالجة الحدث**
    await handleWebhookEvent(event, transaction);
    
    await transaction.commit();
    res.json({ received: true });
    
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Webhook Error:", err);
    res.status(500).json({
      message: "خطأ في معالجة webhook",
      error: err.message,
    });
  }
};

// ✅ **3. معالجة أحداث Webhook**
async function handleWebhookEvent(event, transaction) {
  console.log(`📨 معالجة حدث: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`✅ جلسة دفع مكتملة: ${session.id}`);
      
      await processCompletedPayment(session, transaction);
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      console.log(`❌ انتهت صلاحية جلسة: ${expiredSession.id}`);
      
      await Payment.update(
        { status: "failed" },
        { 
          where: { stripe_session_id: expiredSession.id },
          transaction 
        }
      );
      break;

    default:
      console.log(`ℹ️ حدث غير معالج: ${event.type}`);
  }
}

// ✅ **4. معالجة الدفع المكتمل**
async function processCompletedPayment(session, transaction) {
  try {
    // 🔴 **البحث عن الدفع بواسطة session_id**
    const payment = await Payment.findOne({
      where: { stripe_session_id: session.id },
      transaction,
    });

    if (!payment) {
      console.error("❌ لم يتم العثور على الدفع للـ session:", session.id);
      throw new Error("Payment record not found");
    }

    // 🔴 **تحديث معلومات الدفع**
    await payment.update({
      status: "completed",
      timestamp: new Date(),
      customer_name: session.customer_details?.name || "غير معروف",
      country: session.customer_details?.address?.country || "غير معروف",
      address: session.customer_details?.address?.line1 || "غير معروف",
      card_number_last4: session.payment_method_details?.card?.last4 || "0000",
      card_exp_month: session.payment_method_details?.card?.exp_month || 0,
      card_exp_year: session.payment_method_details?.card?.exp_year || 0,
      card_brand: session.payment_method_details?.card?.brand || "unknown",
    }, { transaction });

    console.log(`✅ تم تحديث الدفع: ${payment.id}`);

    // 🔴 **تحديث حالة التذكرة/التذاكر**
    const ticket = await Ticket.findByPk(payment.ticket_id, { transaction });
    
    if (!ticket) {
      console.error("❌ لم يتم العثور على التذكرة:", payment.ticket_id);
      return;
    }

    // 🔴 **فحص إذا كانت تذكرة دورية**
    if (ticket.is_periodic_ticket && ticket.periodic_ticket_number) {
      await updatePeriodicTickets(ticket.periodic_ticket_number, session.payment_intent, transaction);
    } else {
      await updateSingleTicket(ticket, session.payment_intent, transaction);
    }

    console.log(`✅ تم تأكيد الدفع لـ session: ${session.id}`);

  } catch (error) {
    console.error("❌ خطأ في معالجة الدفع المكتمل:", error.message);
    throw error;
  }
}

// ✅ **5. تحديث التذاكر الدورية**
async function updatePeriodicTickets(periodicNumber, paymentReference, transaction) {
  const allTickets = await Ticket.findAll({
    where: {
      periodic_ticket_number: periodicNumber,
      status: 'pending'
    },
    transaction,
  });

  console.log(`🔄 تحديث ${allTickets.length} تذكرة دورية`);

  for (const t of allTickets) {
    const qrData = JSON.stringify({
      ticket_id: t.id,
      ticket_number: t.ticket_number,
      user_id: t.user_id,
      from_station_id: t.from_station_id,
      to_station_id: t.to_station_id,
      trip_date: t.periodic_start_date,
      discount_type: t.discount_type,
      valid_until: t.periodic_end_date
    });

    const qrCode = await QRCode.toDataURL(qrData);

    await t.update({
      status: "confirmed",
      qr_code: qrCode,
      payment_reference: paymentReference,
      confirmed_at: new Date(),
    }, { transaction });
  }

  console.log(`✅ تم تأكيد ${allTickets.length} تذكرة دورية`);
}

// ✅ **6. تحديث تذكرة عادية**
async function updateSingleTicket(ticket, paymentReference, transaction) {
  const qrData = JSON.stringify({
    ticket_id: ticket.id,
    ticket_number: ticket.ticket_number,
    user_id: ticket.user_id,
    from_station_id: ticket.from_station_id,
    to_station_id: ticket.to_station_id,
    trip_date: ticket.trip_date || new Date().toISOString().split('T')[0]
  });

  const qrCode = await QRCode.toDataURL(qrData);

  await ticket.update({
    status: "confirmed",
    qr_code: qrCode,
    payment_reference: paymentReference,
    confirmed_at: new Date(),
  }, { transaction });

  console.log(`✅ تم تأكيد تذكرة عادية: ${ticket.id}`);
}

// ✅ **7. Webhook للاختبار (بدون توقيع)**
async function handleTestWebhook(req, res) {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("🧪 معالجة Webhook اختبار");
    
    const { session_id, periodic_ticket_number } = req.body;
    
    if (!session_id && !periodic_ticket_number) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "أرسل إما session_id أو periodic_ticket_number" 
      });
    }

    let payment;
    
    if (session_id) {
      payment = await Payment.findOne({
        where: { stripe_session_id: session_id },
        transaction
      });
    } else {
      const ticket = await Ticket.findOne({
        where: { periodic_ticket_number, status: 'pending' },
        transaction
      });
      
      if (ticket) {
        payment = await Payment.findOne({
          where: { ticket_id: ticket.id },
          transaction
        });
      }
    }

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: "لم يتم العثور على عملية دفع",
        instructions: "استخدم manual-confirm بدلاً من ذلك"
      });
    }

    // محاكاة تحديث الدفع
    await payment.update({
      status: "completed",
      timestamp: new Date(),
      customer_name: "Test Webhook Customer",
      country: "Iraq",
      address: "Test Address",
      card_number_last4: "4242",
      card_brand: "visa"
    }, { transaction });

    // تحديث التذاكر
    const ticket = await Ticket.findByPk(payment.ticket_id, { transaction });
    
    if (ticket.is_periodic_ticket && ticket.periodic_ticket_number) {
      await updatePeriodicTickets(ticket.periodic_ticket_number, "test_webhook", transaction);
    } else {
      await updateSingleTicket(ticket, "test_webhook", transaction);
    }

    await transaction.commit();
    
    res.json({
      success: true,
      message: "تم معالجة Webhook اختبار بنجاح",
      note: "هذا للاختبار فقط. في الإنتاج، استخدم Webhook حقيقي من Stripe"
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Test Webhook Error:", err);
    res.status(500).json({
      message: "خطأ في Webhook الاختبار",
      error: err.message,
      suggestion: "استخدم /api/payments/manual-confirm للتطوير"
    });
  }
}

// ✅ **8. تحويل العملة (IQD إلى USD)**
exports.convertCurrency = async (req, res) => {
  try {
    const { amount_iqd } = req.body;
    
    if (!amount_iqd || isNaN(amount_iqd)) {
      return res.status(400).json({ message: "المبلغ بالدينار العراقي مطلوب" });
    }

    const exchangeRate = 1460;
    const amount_usd = amount_iqd / exchangeRate;

    res.json({
      success: true,
      conversion: {
        amount_iqd: parseFloat(amount_iqd).toFixed(2),
        amount_usd: amount_usd.toFixed(2),
        exchange_rate: exchangeRate,
        currency_iqd: "IQD",
        currency_usd: "USD",
        note: "سعر صرف تقريبي للاختبار"
      }
    });
  } catch (err) {
    console.error("Currency Conversion Error:", err);
    res.status(500).json({
      message: "خطأ في تحويل العملة",
      error: err.message,
    });
  }
};

// ✅ **9. الحصول على تفاصيل الدفع**
exports.getPaymentDetails = async (req, res) => {
  try {
    const { session_id, periodic_ticket_number } = req.query;

    if (!session_id && !periodic_ticket_number) {
      return res.status(400).json({ message: "معرف الجلسة أو رقم التذكرة الدورية مطلوب" });
    }

    let payment;
    
    if (session_id) {
      // محاولة جلب من Stripe (إذا كان session حقيقي)
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
          expand: ['payment_intent']
        });

        payment = await Payment.findOne({
          where: { stripe_session_id: session_id },
          include: [
            {
              model: Ticket,
              include: [
                { model: Trip, include: [{ model: Line }] },
                { model: Station, as: "from_station" },
                { model: Station, as: "to_station" },
              ]
            },
            { model: User, attributes: ['id', 'username', 'email'] }
          ]
        });

        res.json({
          success: true,
          payment_status: session.payment_status,
          session_details: {
            id: session.id,
            amount_total: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
          },
          payment_record: payment,
          ticket_details: payment?.Ticket,
          is_live: session.livemode || false
        });

      } catch (stripeError) {
        // إذا كان session وهمي
        payment = await Payment.findOne({
          where: { stripe_session_id: session_id },
          include: [{ model: Ticket }, { model: User }]
        });

        res.json({
          success: true,
          payment_status: payment?.status || "unknown",
          note: "Session وهمي للتطوير",
          payment_record: payment,
          is_mock: true
        });
      }
    } else {
      // البحث برقم التذكرة الدورية
      const ticket = await Ticket.findOne({
        where: { periodic_ticket_number },
        include: [
          { model: Trip, include: [{ model: Line }] },
          { model: Station, as: "from_station" },
          { model: Station, as: "to_station" },
        ]
      });

      if (!ticket) {
        return res.status(404).json({ message: "التذكرة غير موجودة" });
      }

      payment = await Payment.findOne({
        where: { ticket_id: ticket.id },
        include: [{ model: User }]
      });

      res.json({
        success: true,
        periodic_ticket_number,
        ticket_status: ticket.status,
        ticket_details: ticket,
        payment_record: payment,
        has_qr_code: !!ticket.qr_code
      });
    }

  } catch (err) {
    console.error("Get Payment Details Error:", err);
    res.status(500).json({
      message: "خطأ في جلب تفاصيل الدفع",
      error: err.message,
    });
  }
};

// ✅ **10. اختبار دفع وهمي (للتطوير)**
exports.createMockPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ticket_id, periodic_ticket_number } = req.body;
    const user_id = req.user.id;

    console.log(`🧪 بدء دفع وهمي - ticket_id: ${ticket_id}, periodic: ${periodic_ticket_number}`);

    let ticket;
    let tickets = [];
    let isPeriodic = false;

    // 🔴 **البحث عن التذكرة**
    if (periodic_ticket_number) {
      tickets = await Ticket.findAll({
        where: {
          periodic_ticket_number: periodic_ticket_number,
          status: 'pending'
        },
        transaction,
      });

      if (tickets.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: "لم يتم العثور على تذاكر دورية",
          periodic_ticket_number 
        });
      }

      ticket = tickets[0];
      isPeriodic = true;
      console.log(`✅ وجد ${tickets.length} تذكرة دورية`);
    } else {
      if (!ticket_id) {
        await transaction.rollback();
        return res.status(400).json({ message: "يرجى إرسال ticket_id أو periodic_ticket_number" });
      }
      
      ticket = await Ticket.findByPk(ticket_id, { transaction });
      
      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ message: "التذكرة غير موجودة" });
      }
      console.log(`✅ وجد تذكرة عادية: ${ticket.id}`);
    }

    // 🔴 **إنشاء دفع وهمي**
    const mockPayment = await Payment.create({
      amount: isPeriodic ? ticket.total_price * tickets.length : ticket.total_price,
      status: "completed",
      stripe_session_id: `mock_session_${Date.now()}`,
      stripe_payment_intent_id: `mock_pi_${Date.now()}`,
      ticket_id: ticket.id,
      user_id: user_id,
      customer_name: "Test Customer",
      country: "Iraq",
      address: "Test Address, Baghdad",
      card_number_last4: "4242",
      card_exp_month: 12,
      card_exp_year: 2025,
      card_brand: "visa",
      payment_method: "card",
      timestamp: new Date(),
    }, { transaction });

    console.log(`💰 تم إنشاء دفعة وهمية: ${mockPayment.id}`);

    // 🔴 **تأكيد التذاكر**
    if (isPeriodic) {
      for (const t of tickets) {
        const qrData = JSON.stringify({
          ticket_id: t.id,
          ticket_number: t.ticket_number,
          user_id: t.user_id,
          from_station_id: t.from_station_id,
          to_station_id: t.to_station_id,
          period_type: t.discount_type,
          valid_from: t.periodic_start_date,
          valid_until: t.periodic_end_date
        });

        const qrCode = await QRCode.toDataURL(qrData);

        await t.update({
          status: "confirmed",
          qr_code: qrCode,
          payment_reference: mockPayment.stripe_payment_intent_id,
          confirmed_at: new Date(),
        }, { transaction });
      }
      console.log(`✅ تم تأكيد ${tickets.length} تذكرة دورية`);
    } else {
      const qrData = JSON.stringify({
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        user_id: ticket.user_id,
        from_station_id: ticket.from_station_id,
        to_station_id: ticket.to_station_id
      });

      const qrCode = await QRCode.toDataURL(qrData);

      await ticket.update({
        status: "confirmed",
        qr_code: qrCode,
        payment_reference: mockPayment.stripe_payment_intent_id,
        confirmed_at: new Date(),
      }, { transaction });
      console.log(`✅ تم تأكيد تذكرة عادية`);
    }

    await transaction.commit();

    res.json({
      success: true,
      message: "تم محاكاة الدفع بنجاح (وهمي)",
      payment_id: mockPayment.id,
      tickets_updated: isPeriodic ? tickets.length : 1,
      qr_codes_generated: true,
      new_status: "confirmed",
      test_mode: true,
      note: "هذه وظيفة للتطوير فقط، لا تستخدم في الإنتاج",
      next_steps: [
        "استخدم /api/periodic-tickets/my-periodic-tickets لرؤية التذاكر",
        "استخدم /api/payments/details للتحقق من حالة الدفع"
      ]
    });

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Mock Payment Error:", err);
    res.status(500).json({
      message: "خطأ في محاكاة الدفع",
      error: err.message,
      suggestion: "تأكد من وجود التذكرة في قاعدة البيانات"
    });
  }
};

// ✅ **11. تأكيد الدفع يدوياً (للتطوير - بديل Webhook)**
exports.manualConfirmPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user.id;
    const { periodic_ticket_number } = req.body;

    console.log(`🔄 بدء تأكيد يدوي للتذكرة: ${periodic_ticket_number}`);

    if (!periodic_ticket_number) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "يرجى إرسال periodic_ticket_number" 
      });
    }

    // البحث عن جميع تذاكر هذا الحجز
    const tickets = await Ticket.findAll({
      where: {
        periodic_ticket_number: periodic_ticket_number,
        status: 'pending'
      },
      include: [
        { model: Station, as: "from_station", attributes: ["name"] },
        { model: Station, as: "to_station", attributes: ["name"] },
        { model: Trip, include: [{ model: Line }] }
      ],
      transaction
    });

    if (tickets.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: "لم يتم العثور على تذاكر قيد الانتظار",
        periodic_ticket_number,
        suggestion: "قد تكون التذاكر مؤكدة مسبقاً"
      });
    }

    const firstTicket = tickets[0];
    
    console.log(`🔍 وجد ${tickets.length} تذكرة للتأكيد`);

    // 🔥 تحديث التذاكر وإنشاء QR Codes
    for (const ticket of tickets) {
      const qrData = JSON.stringify({
        periodic_ticket_number: ticket.periodic_ticket_number,
        ticket_number: ticket.ticket_number,
        user_id: ticket.user_id,
        from_station: ticket.from_station.name,
        to_station: ticket.to_station.name,
        line_name: ticket.Trip?.Line?.line_name || "غير معروف",
        trip_date: ticket.periodic_start_date,
        valid_until: ticket.periodic_end_date,
        discount_type: ticket.discount_type,
        quantity: ticket.quantity
      });
      
      const qrCode = await QRCode.toDataURL(qrData);
      
      await ticket.update({
        status: "confirmed",
        qr_code: qrCode,
        payment_reference: `manual_confirm_${Date.now()}`,
        confirmed_at: new Date()
      }, { transaction });
      
      console.log(`✅ تم تأكيد تذكرة: ${ticket.ticket_number}`);
    }

    // 🔥 تسجيل عملية الدفع في جدول Payments
    const totalAmount = tickets.reduce((sum, t) => sum + parseFloat(t.total_price), 0);
    
    const payment = await Payment.create({
      amount: totalAmount,
      status: "completed",
      stripe_session_id: `manual_session_${Date.now()}`,
      stripe_payment_intent_id: `manual_pi_${Date.now()}`,
      ticket_id: firstTicket.id,
      user_id: user_id,
      customer_name: "Manual Confirmation",
      country: "Iraq",
      address: "Manual Update",
      card_number_last4: "4242",
      card_brand: "visa",
      payment_method: "card",
      timestamp: new Date()
    }, { transaction });

    console.log(`💰 تم تسجيل دفعة يدوية: ${payment.id}`);

    await transaction.commit();

    // جلب معلومات الخط للمستخدم
    const lineName = firstTicket.Trip?.Line?.line_name || "غير معروف";

    res.json({
      success: true,
      message: "✅ تم تأكيد الدفع يدوياً بنجاح!",
      summary: {
        periodic_ticket_number: periodic_ticket_number,
        confirmed_tickets: tickets.length,
        total_amount: totalAmount.toFixed(2),
        line: lineName,
        from_station: firstTicket.from_station.name,
        to_station: firstTicket.to_station.name,
        period_type: firstTicket.discount_type === 'weekly' ? 'أسبوعي' : 'شهري',
        valid_from: firstTicket.periodic_start_date,
        valid_until: firstTicket.periodic_end_date
      },
      technical_details: {
        payment_id: payment.id,
        qr_codes_generated: true,
        new_status: "confirmed",
        reference: payment.stripe_payment_intent_id
      },
      next_steps: [
        "استخدم /api/periodic-tickets/my-periodic-tickets لرؤية التذاكر المؤكدة",
        "استخدم /api/payments/details?periodic_ticket_number=... للتحقق من الدفع"
      ]
    });

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Manual Confirm Error:", err);
    res.status(500).json({
      message: "خطأ في التأكيد اليدوي",
      error: err.message,
      suggestion: "تأكد من صحة periodic_ticket_number"
    });
  }
};

// ✅ **12. اختبار اتصال Stripe**
exports.testStripeConnection = async (req, res) => {
  try {
    console.log("🔍 اختبار اتصال Stripe...");
    
    // محاولة بسيطة للاتصال
    const balance = await stripe.balance.retrieve();
    
    console.log("✅ اتصال Stripe ناجح!");
    
    res.json({
      success: true,
      message: "اتصال Stripe يعمل بنجاح",
      stripe_mode: "test",
      balance_available: balance.available[0]?.amount || 0,
      balance_pending: balance.pending[0]?.amount || 0,
      currency: balance.available[0]?.currency || "usd",
      test_card: "4242 4242 4242 4242",
      api_version: "2025-11-17.clover"
    });
    
  } catch (err) {
    console.error("❌ فشل اختبار Stripe:", err.message);
    
    res.status(500).json({
      success: false,
      message: "فشل اتصال Stripe",
      error: err.message,
      type: err.type,
      suggestion: "تأكد من صحة مفتاح Stripe أو استخدم الدفع الوهمي"
    });
  }
};

// ✅ **13. استرداد تذكرة (للتطوير)**
exports.refundTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ticket_id, periodic_ticket_number } = req.body;
    
    if (!ticket_id && !periodic_ticket_number) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "أرسل إما ticket_id أو periodic_ticket_number" 
      });
    }

    let tickets;
    
    if (periodic_ticket_number) {
      tickets = await Ticket.findAll({
        where: { periodic_ticket_number },
        transaction
      });
    } else {
      const ticket = await Ticket.findByPk(ticket_id, { transaction });
      tickets = ticket ? [ticket] : [];
    }

    if (tickets.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "لم يتم العثور على تذاكر" });
    }

    // تحديث حالة التذاكر
    for (const ticket of tickets) {
      await ticket.update({
        status: "cancelled",
        cancelled_at: new Date(),
        refunded_at: new Date()
      }, { transaction });
    }

    // تحديث حالة الدفع
    await Payment.update(
      { status: "refunded" },
      { 
        where: { ticket_id: tickets[0].id },
        transaction 
      }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: "تم استرداد التذاكر بنجاح",
      tickets_refunded: tickets.length,
      new_status: "cancelled",
      refund_date: new Date()
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Refund Error:", err);
    res.status(500).json({
      message: "خطأ في الاسترداد",
      error: err.message
    });
  }
};