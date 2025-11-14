import React, { useState, useCallback } from 'react';
import "../../styles/AddPasswordModal.css";
import { useDispatch } from "react-redux"; 
import { addItem } from "./vaultSlice";

const AddPasswordModal = ({ isOpen, onClose, onAddPassword }) => {
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [website, setWebsite] = useState('');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');
    
    const [activeTab, setActiveTab] = useState('details'); 
    
    const [showPassword, setShowPassword] = useState(false);

    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(false);

    const dispatch = useDispatch();

    const generatePassword = useCallback(() => {
        let characterSet = '';
        if (includeUppercase) characterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) characterSet += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) characterSet += '0123456789';
        if (includeSymbols) characterSet += '!@#$%^&*()_+-=[]{}|;:",./<>?`~';

        if (characterSet.length === 0) {
            setPassword('Select at least one character type.');
            return;
        }

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characterSet.length);
            newPassword += characterSet[randomIndex];
        }
        setPassword(newPassword);
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

    const useGeneratedPassword = () => {
        if (password && password.length > 0) {
             setActiveTab('details'); 
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newPassword = { 
            id: Date.now(), 
            title, 
            username, 
            password,
            website,
            category,
            notes 
        };

        dispatch(addItem(newPassword)); 

        // Clear form fields and close modal
        setTitle('');
        setUsername('');
        setPassword('');
        setWebsite('');
        setCategory('');
        setNotes('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Prevent closing when clicking inside the content */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                {/* 1. MODAL HEADER */}
                <div className="modal-header">
                    <div>
                        <h3>Add New Password</h3>
                        <div className="modal-header-text">Create a new password entry for your vault</div>
                    </div>
                </div>

                {/* 2. TAB NAVIGATION */}
                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generator')}
                    >
                        Generator
                    </button>
                </div>
                
                {/* 3. MODAL BODY (Form) */}
                <div className="modal-body">
                    {/* DETAILS TAB CONTENT*/}
                    <form id="add-password-form" onSubmit={handleSubmit} style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
                        {activeTab==='details' && (
                            <>
                                {/* Title */}
                                <div className="form-group">
                                    <label htmlFor="title">Title *</label>
                                    <input 
                                        id="title"
                                        type="text" 
                                        placeholder="e.g., Gmail Account" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </div>

                                {/* Username / Email */}
                                <div className="form-group">
                                    <label htmlFor="username">Username / Email *</label>
                                    <input 
                                        id="username"
                                        type="email" 
                                        placeholder="e.g., user@example.com" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        required 
                                    />
                                </div>

                                {/* Password with Visibility Toggle */}
                                <div className="form-group">
                                    <label htmlFor="password">Password *</label>
                                    <div className="password-input-group">
                                        <input 
                                            id="password"
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="Enter password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                        />
                                        <button 
                                            type="button" 
                                            className="password-visibility-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                // SVG for CLOSED Eye (e.g., eye with a slash through it)
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.2em', height: '1.2em' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7 1.274-4.057 5.065-7 9.542-7a9.965 9.965 0 011.875.175M17.5 12a3 3 0 01-5.75-.417M20.8 19.8l-1.4-1.4M3.2 3.2l1.4 1.4M20 7.375A10.05 10.05 0 0012 5c-4.477 0-8.268 2.943-9.542 7M1 1l22 22" />
                                                    </svg>
                                                ) : (
                                                    // SVG for OPEN Eye (e.g., standard eye icon)
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.2em', height: '1.2em' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Website URL */}
                                <div className="form-group">
                                    <label htmlFor="website">Website URL</label>
                                    <input 
                                        id="website"
                                        type="url" 
                                        placeholder="https://example.com" 
                                        value={website} 
                                        onChange={(e) => setWebsite(e.target.value)} 
                                    />
                                </div>
                                
                                {/* Category (Using a simple select for now) */}
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select 
                                        id="category"
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)} 
                                    >
                                        <option value="General">General</option>
                                        <option>Social Media</option>
                                        <option>Banking</option>
                                        <option>Email</option>
                                        <option>Shopping</option>
                                        <option>Work</option>
                                        <option>Entertainment</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                
                                {/* Notes */}
                                <div className="form-group">
                                    <label htmlFor="notes">Notes</label>
                                    <textarea
                                        id="notes"
                                        placeholder="Additional notes (will be encrypted)"
                                        value={notes} 
                                        onChange={(e) => setNotes(e.target.value)} 
                                        rows="3"
                                    />
                                </div>
                             </>
                        )}
                    </form>

                    {/* GENERATOR TAB CONTENT (New Section) */}
                    {activeTab === 'generator' && (
                        <div className="generator-section">
                            <h4>Password Generator</h4>

                            {/* Password Display Field */}
                            <div className="password-display-group">
                                <div className="password-display-input">
                                    <input 
                                        type="text" 
                                        readOnly
                                        placeholder="Click generate to create a password" 
                                        value={password}
                                    />
                                    <div className="password-actions">
                                        {/* Copy Button */}
                                        <button 
                                            type="button" 
                                            className="action-button" 
                                            onClick={() => navigator.clipboard.writeText(password)}
                                            title="Copy password"
                                        >
                                            <span role="img" aria-label="Copy">📋</span>
                                        </button>
                                        {/* Refresh/Generate Button */}
                                        <button 
                                            type="button" 
                                            className="action-button" 
                                            onClick={generatePassword}
                                            title="Regenerate password"
                                        >
                                            <span role="img" aria-label="Regenerate">🔄</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Length Slider */}
                            <div className="length-slider-group">
                                <div className="length-header">
                                    <span>Length: {length}</span>
                                    <span>{length}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="8" 
                                    max="32" 
                                    value={length} 
                                    onChange={(e) => setLength(Number(e.target.value))}
                                    className="length-slider"
                                />
                            </div>

                            {/* Character Set Toggles */}
                            <div className="char-set-options">
                                <CharSetToggle label="Uppercase (A-Z)" checked={includeUppercase} onChange={setIncludeUppercase} />
                                <CharSetToggle label="Lowercase (a-z)" checked={includeLowercase} onChange={setIncludeLowercase} />
                                <CharSetToggle label="Numbers (0-9)" checked={includeNumbers} onChange={setIncludeNumbers} />
                                <CharSetToggle label="Symbols (!@#$...)" checked={includeSymbols} onChange={setIncludeSymbols} />
                            </div>
                            
                            {/* Generator Buttons */}
                            <div className="generator-footer">
                                <button type="button" className="generate-button" onClick={generatePassword}>
                                    Generate Password
                                </button>
                                <button 
                                    type="button" 
                                    className="use-button"
                                    onClick={useGeneratedPassword}
                                >
                                    Use Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. MODAL FOOTER */}
                {activeTab === 'details' && (
                    <div className="modal-footer">
                        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="add-button" form="add-password-form">Add Password</button>
                    </div>
                )}

            </div>
        </div>
    );
};


const CharSetToggle = ({ label, checked, onChange }) => (
    <div className="char-set-toggle">
        <span>{label}</span>
        <label className="switch">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
            />
            <span className="slider"></span>
        </label>
    </div>
);

export default AddPasswordModal;