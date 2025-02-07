const { Webhook } = require("svix");
const User = require('../models/User');

const clerkWebhooks = async (req, res) => {
  try {
    console.log("Webhook received:", req.body); // Log incoming request

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verifying Headers
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    const { data, type } = req.body;

    console.log("Webhook type:", type); // Log webhook type

    switch (type) {
      case 'user.created': {
        if (!data.id || !data.email_address || !data.first_name || !data.last_name) {
          throw new Error("Missing required user data for creation");
        }

        const userData = {
          _id: data.id,  // Clerk ID is used as _id
          email: data.email_address?.[0]?.email_address || "", // Ensure email exists
          name: `${data.first_name} ${data.last_name}`,  // Combine first and last name
          imageUrl: data.image_url,
        };

        console.log("Creating user:", userData); // Log user data being created

        // Ensure the creation call does not throw an error by wrapping it in try/catch
        try {
          const createdUser = await User.create(userData);
          console.log("User created successfully:", createdUser);
          res.json({ success: true, message: "User created", user: createdUser });
        } catch (creationError) {
          console.error("Error creating user:", creationError);
          throw new Error("Failed to create user in the database");
        }

        break;
      }

      case 'user.updated': {
        if (!data.id) {
          throw new Error("Missing user ID for update");
        }

        const userData = {
          email: data.email_address?.[0]?.email_address || "",
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };

        console.log("Updating user:", userData); // Log user data being updated

        try {
          const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
          if (!updatedUser) {
            throw new Error(`User with ID ${data.id} not found`);
          }
          console.log("User updated successfully:", updatedUser);
          res.json({ success: true, message: "User updated", user: updatedUser });
        } catch (updateError) {
          console.error("Error updating user:", updateError);
          throw new Error("Failed to update user in the database");
        }

        break;
      }

      case 'user.deleted': {
        if (!data.id) {
          throw new Error("Missing user ID for deletion");
        }

        console.log("Deleting user with ID:", data.id); // Log user deletion

        try {
          const deletedUser = await User.findByIdAndDelete(data.id);
          if (!deletedUser) {
            throw new Error(`User with ID ${data.id} not found`);
          }
          console.log("User deleted successfully:", deletedUser);
          res.json({ success: true, message: "User deleted" });
        } catch (deleteError) {
          console.error("Error deleting user:", deleteError);
          throw new Error("Failed to delete user from the database");
        }

        break;
      }

      default:
        console.log("Unhandled webhook type:", type); // Log unhandled types
        res.status(400).json({ success: false, message: "Unhandled webhook type" });
        break;
    }
  } catch (error) {
    console.error("Error processing webhook:", error); // Log error
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { clerkWebhooks };
