import React, { useState } from 'react';
import '../styles/reviews.css';

const ReviewSection = ({ roomId, roomName }) => {
  const [reviews, setReviews] = useState([
    { id: 1, author: 'John Doe', rating: 5, text: 'Excellent stay! Beautiful views and great service.', date: '2024-01-15' },
    { id: 2, author: 'Sarah K', rating: 4, text: 'Very comfortable room. Could use better WiFi speed.', date: '2024-01-10' },
    { id: 3, author: 'Mike Johnson', rating: 5, text: 'Amazing experience! Highly recommended.', date: '2024-01-05' }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ author: '', rating: 5, text: '' });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.text.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newReview = {
      id: reviews.length + 1,
      author: formData.author,
      rating: formData.rating,
      text: formData.text,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    setFormData({ author: '', rating: 5, text: '' });
    setShowForm(false);
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="review-section">
      <div className="review-header">
        <h3>Guest Reviews</h3>
        <div className="rating-summary">
          <span className="average-rating">{averageRating}</span>
          <span className="rating-stars">{renderStars(Math.round(averageRating))}</span>
          <span className="review-count">({reviews.length} reviews)</span>
        </div>
      </div>

      <button
        className="btn btn-secondary"
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '20px' }}
      >
        {showForm ? 'Cancel' : '+ Write a Review'}
      </button>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
            >
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Terrible</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              placeholder="Share your experience..."
              rows="4"
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">Submit Review</button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-item">
            <div className="review-meta">
              <strong>{review.author}</strong>
              <span className="review-date">{review.date}</span>
            </div>
            <div className="review-rating">{renderStars(review.rating)}</div>
            <p className="review-text">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
