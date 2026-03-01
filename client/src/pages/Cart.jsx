import React, { useEffect, useState, useContext } from 'react';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';
import { toast } from 'react-hot-toast';
import { LucideTrash2, LucidePlus, LucideMinus, LucideCreditCard, LucidePackage } from 'lucide-react';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shipping, setShipping] = useState({ name: '', phone: '', street: '', city: '', state: '', zipCode: '' });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/cart/my-cart');
      const cartItems = res.data.cartItems || [];
      setItems(cartItems);
      setTotal(cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
      if (user.name) setShipping(s => ({ ...s, name: user.name }));
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateQty = async (id, q) => {
    if (q < 1) return;
    try {
      await axios.put(`/api/cart/update/${id}`, { quantity: q });
      fetchCart();
    } catch (err) { toast.error("Update Failed"); }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`/api/cart/remove/${id}`);
      toast.success("Manifest Updated");
      fetchCart();
    } catch (err) { toast.error("Removal Failed"); }
  };

  const handleCheckout = async () => {
    if (!shipping.name || !shipping.phone || !shipping.street) {
      toast.error("Manifest Incomplete: Fill Shipping Data");
      return;
    }
    // Manual checkout for demonstration/high-tech feel
    try {
      setLoading(true);
      await axios.post('/api/cart/checkout', { shippingAddress: shipping });
      toast.success("MISSION COMPLETE: ORDER PLACED");
      navigate('/orders');
    } catch (err) {
      toast.error("DECOY DETECTED: CHECKOUT FAILED");
    } finally { setLoading(false); }
  };

  if (!user) return <div className="cart-gate container"><h1>RESTRICTED ACCESS</h1><p>Authenticate to view manifest</p><Link to="/login" className="neon-btn">LOGIN</Link></div>;
  if (loading) return <div className="manifest-loading"><div className="loader"></div></div>;

  return (
    <div className="cart-manifest container">
      <div className="manifest-header">
        <h1 className="glitch-title" data-text="CARGO MANIFEST">CARGO MANIFEST</h1>
        <div className="unit-count">{items.length} ACTIVE UNITS</div>
      </div>

      {items.length === 0 ? (
        <div className="empty-manifest glass">
          <LucidePackage size={60} />
          <h3>MANIFEST EMPTY</h3>
          <p>No hardware detected in current loadout.</p>
          <Link to="/products" className="neon-btn">REARM</Link>
        </div>
      ) : (
        <div className="manifest-grid">
          <div className="manifest-items">
            {items.map(i => (
              <div key={i.id} className="cargo-item glass-card">
                <div className="item-viz">
                  <img src={i.product.imageUrl} alt={i.product.name} />
                </div>
                <div className="item-specs">
                  <h4 className="item-name">{i.product.name}</h4>
                  <div className="item-price">VAL: ₹{i.product.price.toLocaleString()}</div>
                  <div className="item-ops">
                    <div className="qty-box glass">
                      <button onClick={() => updateQty(i.id, i.quantity - 1)}><LucideMinus size={14}/></button>
                      <span>{i.quantity}</span>
                      <button onClick={() => updateQty(i.id, i.quantity + 1)}><LucidePlus size={14}/></button>
                    </div>
                    <button className="eject-btn" onClick={() => removeItem(i.id)}><LucideTrash2 size={18}/></button>
                  </div>
                </div>
                <div className="item-total">₹{(i.product.price * i.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="manifest-summary glass">
            <h3>LOGISTICS SUMMARY</h3>
            <div className="summary-row"><span>SUBTOTAL</span><span>₹{total.toLocaleString()}</span></div>
            <div className="summary-row"><span>FREIGHT</span><span>FREE</span></div>
            <div className="summary-divider"></div>
            <div className="summary-row total"><span>TOTAL VALUATION</span><span>₹{total.toLocaleString()}</span></div>
            
            {!showCheckout ? (
              <button className="neon-btn checkout-trigger" onClick={() => setShowCheckout(true)}>PROCEED TO DISPATCH</button>
            ) : (
              <div className="dispatch-form">
                <h4>DISPATCH COORDINATES</h4>
                <input type="text" placeholder="RECIPIENT NAME" value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
                <input type="text" placeholder="COMMS (PHONE)" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
                <input type="text" placeholder="SECTOR (STREET)" value={shipping.street} onChange={e => setShipping({...shipping, street: e.target.value})} />
                <div className="form-row">
                  <input type="text" placeholder="CITY" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
                  <input type="text" placeholder="ZIP" value={shipping.zipCode} onChange={e => setShipping({...shipping, zipCode: e.target.value})} />
                </div>
                <button className="neon-btn dispatch-btn" onClick={handleCheckout}>CONFIRM DISPATCH</button>
                <button className="cancel-dispatch" onClick={() => setShowCheckout(false)}>ABORT</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

