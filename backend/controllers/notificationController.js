import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
    try {
        const userId=req.user._id;
        const notifications = await Notification.find({to:userId}).populate({path:'from',select:'userName profilePicture'}).sort({createdAt:-1});
        await Notification.updateMany({to:userId},{read:true});//we dont need to use set here because we are updating the whole object
        res.status(200).json({notifications});
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
};

export const deleteNotifications = async (req, res) => {
    try {
        const userId=req.user._id;
        await Notification.deleteMany({to:userId});
        res.status(200).json({message:"Notifications deleted successfully"});
    } catch (error) {
        res.status(500).json({message:error.message });
    }
};
export const deleteNotification = async (req, res) => {
    try {
        const userId=req.user._id;
        const notificationId=req.params.id;
        const notification = await Notification.findById(notificationId);
        if(!notification){
            return res.status(404).json({message:"Notification not found"});
        }
        if(notification.to.toString()!==userId){
            return res.status(403).json({message:"You are not authorized to delete this notification"});
        }
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({message:"Notification deleted successfully"});
    } catch (error) {
        res.status(500).json({message:error.message });
    }
};