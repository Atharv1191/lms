const { Webhook } = require("svix");
const User = require("../models/User");
const Stripe = require("stripe");
const Purchase = require("../models/Purchase");
const Course = require("../models/Course");
require('dotenv').config()
const clerkWebhooks = async (req, res) => {
  try {

    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Verifying Headers
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    // Getting Data from request body
    const { data, type } = req.body

    // Switch Cases for differernt Events
    switch (type) {
      case 'user.created': {

        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          resume: ''
        }
        await User.create(userData)
        res.json({})
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        res.json({})
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }
      default:
        break;
    }

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}
  

// Stripe Gateway Initialize

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    // Make sure `request.body` is the raw buffer, not JSON-parsed
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      const { purchaseId, userId, courseId } = session.metadata;

      try {
        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!purchaseData || !userData || !courseData) {
          console.error("❌ Data not found: ", { purchaseId, userId, courseId });
          break;
        }

        // Update course and user enrollments
        courseData.enrolledStudents.addToSet(userData._id);
        await courseData.save();

        userData.enrolledCourses.addToSet(courseData._id);
        await userData.save();

        // Mark purchase as completed
        purchaseData.status = 'completed';
        await purchaseData.save();

        console.log("✅ Enrollment completed successfully");
      } catch (error) {
        console.error("❌ Error handling checkout.session.completed:", error);
      }

      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object;

      try {
        // You can store purchaseId in metadata even here if needed
        const { purchaseId } = intent.metadata || {};
        if (purchaseId) {
          const purchaseData = await Purchase.findById(purchaseId);
          if (purchaseData) {
            purchaseData.status = 'failed';
            await purchaseData.save();
          }
        }
      } catch (error) {
        console.error("❌ Error handling payment failure:", error);
      }

      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
};



module.exports = { clerkWebhooks, stripeWebhooks };

