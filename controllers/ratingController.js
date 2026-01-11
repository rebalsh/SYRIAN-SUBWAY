const db = require("../models");
const Rating = db.Rating;
const Trip = db.Trip;
const User = db.User;
const sequelize = db.sequelize;

// ✅ التحقق من إمكانية التقييم (الرحلة انتهت ولم يتم التقييم من قبل)
exports.checkRatingEligibility = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user_id = req.user.id;

    // 1. التحقق من نوع المستخدم (يجب أن يكون راكب = userType = 1)
    if (req.user.userType !== 1) {
      return res.status(403).json({
        message: "التقييم متاح فقط للمسافرين (الركاب)",
        allowed_user_type: 1,
        your_user_type: req.user.userType
      });
    }

    // 2. التحقق من وجود الرحلة
    const trip = await Trip.findByPk(trip_id);
    if (!trip) {
      return res.status(404).json({
        message: "الرحلة غير موجودة"
      });
    }

    // 3. التحقق من أن المستخدم لديه تذكرة في هذه الرحلة
    const userTicket = await db.Ticket.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      }
    });

    if (!userTicket) {
      return res.status(403).json({
        message: "لا يمكنك تقييم رحلة لم تسافر فيها",
        has_ticket: false
      });
    }

    // 4. التحقق من انتهاء الرحلة
    const currentTime = new Date();
    const tripEndTime = new Date(trip.end_time);

    if (currentTime < tripEndTime) {
      return res.status(400).json({
        message: "لا يمكن تقييم الرحلة إلا بعد انتهائها",
        trip_end_time: trip.end_time,
        current_time: currentTime,
        can_rate: false
      });
    }

    // 5. التحقق مما إذا كان المستخدم قد قام بالتقييم من قبل
    const existingRating = await Rating.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      }
    });

    if (existingRating) {
      return res.status(400).json({
        message: "لقد قمت بتقييم هذه الرحلة من قبل",
        existing_rating: existingRating.rating_value,
        can_rate_again: false
      });
    }

    // 6. إذا كان كل شيء جيد
    res.json({
      message: "يمكنك تقييم هذه الرحلة",
      trip_id: trip_id,
      trip_end_time: trip.end_time,
      can_rate: true,
      user_type: req.user.userType,
      user_type_name: "راكب",
      trip_details: {
        line_id: trip.line_id,
        start_time: trip.start_time,
        end_time: trip.end_time,
        status: trip.status
      }
    });

  } catch (err) {
    console.error("Error checking rating eligibility:", err);
    res.status(500).json({
      message: "خطأ في التحقق من إمكانية التقييم",
      error: err.message
    });
  }
};

// ✅ إضافة تقييم للرحلة (للمسافرين فقط userType = 1)
exports.addRating = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { trip_id } = req.params;
    const { rating_value } = req.body;
    const user_id = req.user.id;

    // 1. التحقق من نوع المستخدم (يجب أن يكون راكب = userType = 1)
    if (req.user.userType !== 1) {
      await transaction.rollback();
      return res.status(403).json({
        message: "التقييم متاح فقط للمسافرين (الركاب)",
        allowed_user_type: 1,
        your_user_type: req.user.userType
      });
    }

    // 2. التحقق من البيانات المدخلة
    if (!rating_value || !["1", "2", "3", "4", "5"].includes(rating_value)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "التقييم يجب أن يكون بين 1 و 5 نجمة"
      });
    }

    // 3. التحقق من وجود الرحلة
    const trip = await Trip.findByPk(trip_id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({
        message: "الرحلة غير موجودة"
      });
    }

    // 4. التحقق من أن المستخدم لديه تذكرة في هذه الرحلة
    const userTicket = await db.Ticket.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      },
      transaction
    });

    if (!userTicket) {
      await transaction.rollback();
      return res.status(403).json({
        message: "لا يمكنك تقييم رحلة لم تسافر فيها",
        has_ticket: false
      });
    }

    // 5. التحقق من انتهاء الرحلة
    const currentTime = new Date();
    const tripEndTime = new Date(trip.end_time);

    if (currentTime < tripEndTime) {
      await transaction.rollback();
      return res.status(400).json({
        message: "لا يمكن تقييم الرحلة إلا بعد انتهائها",
        trip_end_time: trip.end_time,
        current_time: currentTime
      });
    }

    // 6. التحقق من التقييم السابق
    const existingRating = await Rating.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      },
      transaction
    });

    if (existingRating) {
      await transaction.rollback();
      return res.status(400).json({
        message: "لقد قمت بتقييم هذه الرحلة من قبل",
        existing_rating: existingRating.rating_value
      });
    }

    // 7. إنشاء التقييم
    const newRating = await Rating.create({
      trip_id: trip_id,
      user_id: user_id,
      rating_value: rating_value
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: "تم إضافة تقييم الرحلة بنجاح",
      rating: {
        id: newRating.id,
        trip_id: newRating.trip_id,
        user_id: newRating.user_id,
        rating_value: newRating.rating_value,
        created_at: newRating.created_at
      },
      stars: "★".repeat(parseInt(rating_value)) + "☆".repeat(5 - parseInt(rating_value)),
      user_type: "راكب",
      user_info: {
        user_id: req.user.id,
        username: req.user.username
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error adding rating:", err);
    res.status(500).json({
      message: "خطأ في إضافة تقييم الرحلة",
      error: err.message
    });
  }
};

// ✅ جلب تقييمات رحلة معينة (الجميع يمكنهم رؤية التقييمات)
exports.getTripRatings = async (req, res) => {
  try {
    const { trip_id } = req.params;

    // التحقق من وجود الرحلة
    const trip = await Trip.findByPk(trip_id);
    if (!trip) {
      return res.status(404).json({
        message: "الرحلة غير موجودة"
      });
    }

    // جلب جميع التقييمات للرحلة (مع معلومات المستخدمين فقط من نوع راكب)
    const ratings = await Rating.findAll({
      where: { trip_id: trip_id },
      include: [{
        model: User,
        attributes: ['id', 'username', 'userType'],
        where: { userType: 1 } // فقط المسافرين
      }],
      order: [['created_at', 'DESC']]
    });

    // حساب متوسط التقييم
    let averageRating = 0;
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, rating) => sum + parseInt(rating.rating_value), 0);
      averageRating = (total / ratings.length).toFixed(1);
    }

    // تجميع التقييمات حسب النجوم
    const ratingDistribution = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    };

    ratings.forEach(rating => {
      ratingDistribution[rating.rating_value]++;
    });

    // إحصائية المسافرين الذين قاموا بالتقييم
    const totalPassengers = await db.Ticket.count({
      where: { trip_id: trip_id }
    });

    const ratingPercentage = totalPassengers > 0 
      ? ((ratings.length / totalPassengers) * 100).toFixed(1)
      : 0;

    res.json({
      message: "تم جلب تقييمات الرحلة بنجاح",
      trip_id: trip_id,
      total_ratings: ratings.length,
      total_passengers: totalPassengers,
      rating_percentage: ratingPercentage + "%",
      average_rating: averageRating,
      rating_distribution: ratingDistribution,
      ratings: ratings.map(rating => ({
        id: rating.id,
        user_id: rating.user_id,
        username: rating.User ? rating.User.username : 'مسافر',
        user_type: rating.User ? rating.User.userType : null,
        rating_value: rating.rating_value,
        stars: "★".repeat(parseInt(rating.rating_value)) + "☆".repeat(5 - parseInt(rating.rating_value)),
        created_at: rating.created_at
      }))
    });

  } catch (err) {
    console.error("Error fetching trip ratings:", err);
    res.status(500).json({
      message: "خطأ في جلب تقييمات الرحلة",
      error: err.message
    });
  }
};

// ✅ جلب تقييم المستخدم لرحلة معينة (للمسافرين فقط)
exports.getMyRatingForTrip = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user_id = req.user.id;

    // التحقق من نوع المستخدم (يجب أن يكون راكب = userType = 1)
    if (req.user.userType !== 1) {
      return res.status(403).json({
        message: "هذه الخدمة مخصصة للمسافرين فقط",
        allowed_user_type: 1,
        your_user_type: req.user.userType
      });
    }

    // التحقق من وجود الرحلة
    const trip = await Trip.findByPk(trip_id);
    if (!trip) {
      return res.status(404).json({
        message: "الرحلة غير موجودة"
      });
    }

    // جلب تقييم المستخدم لهذه الرحلة
    const myRating = await Rating.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      }
    });

    if (!myRating) {
      return res.status(404).json({
        message: "لم تقم بتقييم هذه الرحلة بعد",
        has_rating: false,
        user_type: "راكب"
      });
    }

    res.json({
      message: "تم جلب تقييمك للرحلة",
      has_rating: true,
      user_type: "راكب",
      rating: {
        id: myRating.id,
        trip_id: myRating.trip_id,
        rating_value: myRating.rating_value,
        stars: "★".repeat(parseInt(myRating.rating_value)) + "☆".repeat(5 - parseInt(myRating.rating_value)),
        created_at: myRating.created_at
      }
    });

  } catch (err) {
    console.error("Error fetching my rating:", err);
    res.status(500).json({
      message: "خطأ في جلب تقييمك",
      error: err.message
    });
  }
};

// ✅ تحديث تقييم الرحلة (للمسافرين فقط)
exports.updateRating = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { trip_id } = req.params;
    const { rating_value } = req.body;
    const user_id = req.user.id;

    // 1. التحقق من نوع المستخدم (يجب أن يكون راكب = userType = 1)
    if (req.user.userType !== 1) {
      await transaction.rollback();
      return res.status(403).json({
        message: "التقييم متاح فقط للمسافرين (الركاب)",
        allowed_user_type: 1,
        your_user_type: req.user.userType
      });
    }

    // التحقق من البيانات المدخلة
    if (!rating_value || !["1", "2", "3", "4", "5"].includes(rating_value)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "التقييم يجب أن يكون بين 1 و 5 نجمة"
      });
    }

    // البحث عن التقييم الحالي
    const existingRating = await Rating.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      },
      transaction
    });

    if (!existingRating) {
      await transaction.rollback();
      return res.status(404).json({
        message: "لم تقم بتقييم هذه الرحلة من قبل"
      });
    }

    // تحديث التقييم
    await existingRating.update({
      rating_value: rating_value
    }, { transaction });

    await transaction.commit();

    res.json({
      message: "تم تحديث تقييم الرحلة بنجاح",
      user_type: "راكب",
      rating: {
        id: existingRating.id,
        trip_id: existingRating.trip_id,
        rating_value: existingRating.rating_value,
        stars: "★".repeat(parseInt(existingRating.rating_value)) + "☆".repeat(5 - parseInt(existingRating.rating_value)),
        updated_at: new Date()
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error updating rating:", err);
    res.status(500).json({
      message: "خطأ في تحديث تقييم الرحلة",
      error: err.message
    });
  }
};

// ✅ حذف تقييم الرحلة (للمسافرين فقط)
exports.deleteRating = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { trip_id } = req.params;
    const user_id = req.user.id;

    // 1. التحقق من نوع المستخدم (يجب أن يكون راكب = userType = 1)
    if (req.user.userType !== 1) {
      await transaction.rollback();
      return res.status(403).json({
        message: "هذه الخدمة مخصصة للمسافرين فقط",
        allowed_user_type: 1,
        your_user_type: req.user.userType
      });
    }

    // البحث عن التقييم
    const rating = await Rating.findOne({
      where: {
        trip_id: trip_id,
        user_id: user_id
      },
      transaction
    });

    if (!rating) {
      await transaction.rollback();
      return res.status(404).json({
        message: "لم تقم بتقييم هذه الرحلة"
      });
    }

    // حذف التقييم
    await rating.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: "تم حذف تقييم الرحلة بنجاح",
      user_type: "راكب",
      deleted_rating: {
        id: rating.id,
        trip_id: rating.trip_id,
        rating_value: rating.rating_value
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error deleting rating:", err);
    res.status(500).json({
      message: "خطأ في حذف تقييم الرحلة",
      error: err.message
    });
  }
};

// ✅ جلب رحلاتي التي انتهت ويمكنني تقييمها (للمسافرين فقط)
exports.getRateableTrips = async (req, res) => {
  try {
    const user_id = req.user.id;
    const currentTime = new Date();

    // 1. التحقق من نوع المستخدم (يجب أن يكون راكب = userType = 1)
    if (req.user.userType !== 1) {
      return res.status(403).json({
        message: "هذه الخدمة مخصصة للمسافرين فقط",
        allowed_user_type: 1,
        your_user_type: req.user.userType
      });
    }

    // جلب جميع الرحلات التي شارك فيها المستخدم وانتهت
    const tickets = await db.Ticket.findAll({
      where: { user_id: user_id },
      include: [{
        model: Trip,
        where: {
          end_time: { [db.Sequelize.Op.lt]: currentTime }
        },
        attributes: ['id', 'start_time', 'end_time', 'status', 'line_id']
      }],
      order: [[Trip, 'end_time', 'DESC']]
    });

    // التحقق من كل رحلة إذا تم تقييمها
    const rateableTrips = await Promise.all(
      tickets.map(async (ticket) => {
        if (!ticket.Trip) return null;

        const existingRating = await Rating.findOne({
          where: {
            trip_id: ticket.Trip.id,
            user_id: user_id
          }
        });

        return {
          trip_id: ticket.Trip.id,
          ticket_id: ticket.id,
          start_time: ticket.Trip.start_time,
          end_time: ticket.Trip.end_time,
          status: ticket.Trip.status,
          line_id: ticket.Trip.line_id,
          can_rate: !existingRating,
          already_rated: !!existingRating,
          existing_rating: existingRating ? existingRating.rating_value : null
        };
      })
    );

    // تصفية القيم null
    const filteredTrips = rateableTrips.filter(trip => trip !== null);

    res.json({
      message: "تم جلب الرحلات القابلة للتقييم",
      user_type: "راكب",
      total_trips: filteredTrips.length,
      trips: filteredTrips.filter(trip => trip.can_rate),
      already_rated_trips: filteredTrips.filter(trip => !trip.can_rate).length,
      user_info: {
        user_id: req.user.id,
        username: req.user.username
      }
    });

  } catch (err) {
    console.error("Error fetching rateable trips:", err);
    res.status(500).json({
      message: "خطأ في جلب الرحلات القابلة للتقييم",
      error: err.message
    });
  }
};

// ✅ جلب إحصائيات التقييمات لرحلة معينة (للإداريين والمشرفين)
exports.getTripRatingStats = async (req, res) => {
  try {
    const { trip_id } = req.params;

    // التحقق من صلاحيات المستخدم (الإداريين فقط)
    if (![2, 3, 4].includes(req.user.userType)) {
      return res.status(403).json({
        message: "هذه الخدمة مخصصة للإداريين فقط",
        allowed_user_types: [2, 3, 4],
        your_user_type: req.user.userType
      });
    }

    const trip = await Trip.findByPk(trip_id);
    if (!trip) {
      return res.status(404).json({
        message: "الرحلة غير موجودة"
      });
    }

    // جلب جميع التقييمات
    const ratings = await Rating.findAll({
      where: { trip_id: trip_id },
      include: [{
        model: User,
        attributes: ['id', 'username'],
        where: { userType: 1 }
      }]
    });

    // حساب الإحصائيات
    const totalRatings = ratings.length;
    const totalPassengers = await db.Ticket.count({
      where: { trip_id: trip_id }
    });

    let averageRating = 0;
    if (totalRatings > 0) {
      const total = ratings.reduce((sum, rating) => sum + parseInt(rating.rating_value), 0);
      averageRating = (total / totalRatings).toFixed(1);
    }

    const ratingDistribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    ratings.forEach(rating => {
      ratingDistribution[rating.rating_value]++;
    });

    res.json({
      message: "إحصائيات تقييمات الرحلة",
      trip_id: trip_id,
      total_passengers: totalPassengers,
      total_ratings: totalRatings,
      rating_percentage: totalPassengers > 0 ? ((totalRatings / totalPassengers) * 100).toFixed(1) + "%" : "0%",
      average_rating: averageRating,
      rating_distribution: ratingDistribution,
      ratings_by_star: [
        { stars: 1, count: ratingDistribution["1"], percentage: totalRatings > 0 ? ((ratingDistribution["1"] / totalRatings) * 100).toFixed(1) + "%" : "0%" },
        { stars: 2, count: ratingDistribution["2"], percentage: totalRatings > 0 ? ((ratingDistribution["2"] / totalRatings) * 100).toFixed(1) + "%" : "0%" },
        { stars: 3, count: ratingDistribution["3"], percentage: totalRatings > 0 ? ((ratingDistribution["3"] / totalRatings) * 100).toFixed(1) + "%" : "0%" },
        { stars: 4, count: ratingDistribution["4"], percentage: totalRatings > 0 ? ((ratingDistribution["4"] / totalRatings) * 100).toFixed(1) + "%" : "0%" },
        { stars: 5, count: ratingDistribution["5"], percentage: totalRatings > 0 ? ((ratingDistribution["5"] / totalRatings) * 100).toFixed(1) + "%" : "0%" }
      ]
    });

  } catch (err) {
    console.error("Error fetching rating stats:", err);
    res.status(500).json({
      message: "خطأ في جلب إحصائيات التقييمات",
      error: err.message
    });
  }
};