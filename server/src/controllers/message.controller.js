const { Message, Conversation } = require('../models/message.model');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, recipientId, content, listingId } = req.body;
        const senderId = req.user._id;
        
        let conversation;
        
        // If conversation ID is provided, use existing conversation
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            
            // Check if user is part of the conversation
            if (!conversation.participants.includes(senderId)) {
                return res.status(403).json({ message: 'Not authorized to send message in this conversation' });
            }
        } 
        // Otherwise create a new conversation
        else {
            if (!recipientId || !listingId) {
                return res.status(400).json({ message: 'Recipient and listing are required for new conversations' });
            }
            
            conversation = new Conversation({
                participants: [senderId, recipientId],
                listing: listingId,
                lastMessage: new Date()
            });
            
            await conversation.save();
        }
        
        // Create and save the message
        const message = new Message({
            conversation: conversation._id,
            sender: senderId,
            content
        });
        
        await message.save();
        
        // Update conversation's last message timestamp
        conversation.lastMessage = new Date();
        await conversation.save();
        
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
};

// Get user's conversations
exports.getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username')
            .populate('listing', 'title')
            .sort({ lastMessage: -1 });
            
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations', error });
    }
};

// Get messages in a conversation
exports.getConversationMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationId } = req.params;
        
        // Check if user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        
        if (!conversation.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }
        
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 });
            
        // Mark unread messages as read
        await Message.updateMany(
            { conversation: conversationId, sender: { $ne: userId }, read: false },
            { read: true }
        );
            
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};