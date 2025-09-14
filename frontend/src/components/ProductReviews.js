import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import axios from '../utils/axios';
import StarRating from './StarRating';

const ProductReviews = ({ productId }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    fetchReviews();
  }, [productId]);
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/products/${productId}/reviews`);
      setReviews(response.data);
      
      // Check if user has already submitted a review
      if (isAuthenticated && currentUser) {
        const userExistingReview = response.data.find(review => 
          review.user_id === currentUser.id
        );
        
        if (userExistingReview) {
          setUserReview({
            rating: userExistingReview.rating,
            comment: userExistingReview.comment
          });
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRatingChange = (newRating) => {
    setUserReview(prev => ({ ...prev, rating: newRating }));
  };
  
  const handleCommentChange = (e) => {
    setUserReview(prev => ({ ...prev, comment: e.target.value }));
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await axios.post(`/products/${productId}/reviews`, userReview);
      
      // Update reviews list
      await fetchReviews();
      
      setMessage({ 
        type: 'success', 
        text: 'Your review has been submitted successfully!' 
      });
      
      // Reset form if it's a new review
      if (!reviews.some(review => review.user_id === currentUser.id)) {
        setUserReview({
          rating: 5,
          comment: ''
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setMessage({ 
        type: 'danger', 
        text: err.response?.data?.message || 'Failed to submit review' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  return (
    <div className="product-reviews mt-5">
      <h3 className="mb-4">Reseñas de Clientes</h3>
      
      {isAuthenticated ? (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Escribe una reseña</h5>
          </Card.Header>
          <Card.Body>
            {message.text && (
              <Alert 
                variant={message.type} 
                dismissible 
                onClose={() => setMessage({ type: '', text: '' })}
              >
                {message.text}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Tu calificación</Form.Label>
                <div>
                  <StarRating 
                    rating={userReview.rating} 
                    onRatingChange={handleRatingChange} 
                    editable 
                  />
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tu comentario</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={userReview.comment}
                  onChange={handleCommentChange}
                  required
                />
              </Form.Group>
              
              <Button 
                type="submit" 
                variant="primary" 
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar Reseña'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info" className="mb-4">
          <a href="/login">Inicia sesión</a> para dejar una reseña.
        </Alert>
      )}
      
      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => (
            <Card key={review.id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <StarRating rating={review.rating} />
                    <span className="ms-2 fw-bold">{review.user_name}</span>
                  </div>
                  <small className="text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
                <Card.Text>{review.comment}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Alert variant="light">
          No hay reseñas para este producto. ¡Sé el primero en opinar!
        </Alert>
      )}
    </div>
  );
};

export default ProductReviews;