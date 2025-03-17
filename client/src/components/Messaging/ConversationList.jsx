import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserConversations } from '../../services/message.service';
import './Messaging.css';

const ConversationList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getUserConversations();
                setConversations(data);
            } catch (err) {
                setError('Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) return <div className="loading">Loading conversations...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="conversation-list">
            <h2>Your Messages</h2>
            {conversations.length === 0 ? (
                <p>You don't have any messages yet.</p>
            ) : (
                <ul>
                    {conversations.map(conversation => (
                        <li key={conversation._id}>
                            <Link to={`/messages/${conversation._id}`} className="conversation-item">
                                <div className="conversation-info">
                                    <h4>
                                        {conversation.participants
                                            .filter(p => p._id !== currentUser.id)
                                            .map(p => p.username)
                                            .join(', ')}
                                    </h4>
                                    <p className="listing-name">
                                        {conversation.listing ? conversation.listing.title : 'No listing'}
                                    </p>
                                </div>
                                <span className="conversation-date">
                                    {new Date(conversation.lastMessage).toLocaleDateString()}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ConversationList;