import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    ShieldCheck, ArrowLeft, ShieldAlert, CheckCircle2, 
    Home, Car, Briefcase, Heart, LifeBuoy, Scale,
    Clock, Terminal, Info, Upload, Camera, FileText, User, Calendar, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_METADATA } from '../data/categories';
import { uploadImageToCloudinary } from '../lib/needsService';

export const KYCVerificationPage = () => {
    const { profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_legal_name: '',
        date_of_birth: '',
        residential_address: '',
        id_type: 'National ID',
        id_number: '',
        id_front: null,
        selfie: null,
        utility_bill: null
    });

    const [previews, setPreviews] = useState({
        id_front: null,
        selfie: null,
        utility_bill: null
    });

    const fileRefs = {
        id_front: useRef(),
        selfie: useRef(),
        utility_bill: useRef()
    };

    // Initialize from localStorage
    React.useEffect(() => {
        const savedData = localStorage.getItem(`kyc_draft_${profile?.id}`);
        const savedStep = localStorage.getItem(`kyc_step_${profile?.id}`);
        
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({
                    ...prev,
                    ...parsed,
                    // Ensure files are null as they can't be persisted
                    id_front: null,
                    selfie: null,
                    utility_bill: null
                }));
            } catch (err) {
                console.error("Failed to parse KYC draft", err);
            }
        }
        
        if (savedStep) {
            setStep(parseInt(savedStep));
        }
        
        setIsInitialized(true);
    }, [profile?.id]);

    // Persist to localStorage
    React.useEffect(() => {
        if (!isInitialized || !profile?.id) return;

        const dataToSave = { ...formData };
        delete dataToSave.id_front;
        delete dataToSave.selfie;
        delete dataToSave.utility_bill;

        localStorage.setItem(`kyc_draft_${profile.id}`, JSON.stringify(dataToSave));
        localStorage.setItem(`kyc_step_${profile.id}`, step.toString());
    }, [formData, step, profile?.id, isInitialized]);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your verification progress?")) {
            localStorage.removeItem(`kyc_draft_${profile?.id}`);
            localStorage.removeItem(`kyc_step_${profile?.id}`);
            setFormData({
                full_legal_name: '',
                date_of_birth: '',
                residential_address: '',
                id_type: 'National ID',
                id_number: '',
                id_front: null,
                selfie: null,
                utility_bill: null
            });
            setPreviews({
                id_front: null,
                selfie: null,
                utility_bill: null
            });
            setStep(1);
        }
    };

    const kycStatus = profile?.kyc_status || 'none';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            // 1. Upload Images
            const [idFrontUrl, selfieUrl, utilityBillUrl] = await Promise.all([
                uploadImageToCloudinary(formData.id_front),
                uploadImageToCloudinary(formData.selfie),
                uploadImageToCloudinary(formData.utility_bill)
            ]);

            // 2. Save KYC Details
            const { error: kycError } = await supabase
                .from('kyc_details')
                .upsert({
                    user_id: profile.id,
                    full_legal_name: formData.full_legal_name,
                    date_of_birth: formData.date_of_birth,
                    residential_address: formData.residential_address,
                    id_type: formData.id_type,
                    id_number: formData.id_number,
                    id_front_url: idFrontUrl,
                    selfie_url: selfieUrl,
                    utility_bill_url: utilityBillUrl,
                    submitted_at: new Date().toISOString()
                });

            if (kycError) throw kycError;

            // 3. Update Profile Status
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ kyc_status: 'pending' })
                .eq('id', profile.id);

            if (updateError) throw updateError;
            
            // Clear draft
            localStorage.removeItem(`kyc_draft_${profile.id}`);
            localStorage.removeItem(`kyc_step_${profile.id}`);
            
            await refreshProfile();
        } catch (err) {
            console.error('KYC Submission error:', err);
            setError('Failed to submit verification request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestartVerification = async () => {
        if (!window.confirm("Are you sure you want to restart the verification process? Your current submission will be cleared.")) return;
        
        setSubmitting(true);
        try {
            // 1. Delete details from kyc_details
            await supabase
                .from('kyc_details')
                .delete()
                .eq('user_id', profile.id);

            // 2. Reset status in profiles
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    kyc_status: 'none',
                    verified_at: null
                })
                .eq('id', profile.id);

            if (error) throw error;

            // 3. Clear local draft
            localStorage.removeItem(`kyc_draft_${profile.id}`);
            localStorage.removeItem(`kyc_step_${profile.id}`);

            await refreshProfile();
            setStep(1);
        } catch (err) {
            console.error("Error restarting verification:", err);
            alert("Failed to restart verification. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputContainerStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    };

    const inputStyles = {
        padding: '0.8rem 1rem',
        borderRadius: '12px',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-glass)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        outline: 'none'
    };

    const labelStyles = {
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
    };

    const uploadBoxStyles = (hasFile) => ({
        padding: '1.5rem',
        border: `2px dashed ${hasFile ? 'var(--primary)' : 'var(--border-glass)'}`,
        borderRadius: '16px',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
    });

    if (kycStatus !== 'none' && kycStatus !== 'rejected') {
        const statusConfig = {
            pending: {
                title: 'Verification Pending',
                description: 'Our team is reviewing your profile. We will notify you once approved.',
                icon: <Clock size={48} color="var(--accent)" />
            },
            verified: {
                title: 'You are Verified!',
                description: 'You have full access to all categories and the Shield of Trust badge.',
                icon: <CheckCircle2 size={48} color="#10b981" />
            }
        };
        const current = statusConfig[kycStatus];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
                <header className="sticky-header" style={{ padding: '0.6rem var(--feed-item-padding)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', marginLeft: '-0.5rem' }} className="glass-panel-hover">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Identity Verification</h2>
                </header>
                <div style={{ maxWidth: '500px', width: '100%', margin: '4rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: '24px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                        {current.icon}
                        <h2 className="h2" style={{ margin: 0 }}>{current.title}</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{current.description}</p>
                        
                        {kycStatus === 'pending' && (
                            <button
                                onClick={handleRestartVerification}
                                disabled={submitting}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-base)',
                                    border: '1px solid var(--border-glass)',
                                    color: 'var(--text-primary)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    opacity: submitting ? 0.5 : 1
                                }}
                                className="glass-panel-hover"
                            >
                                {submitting ? 'Restarting...' : 'Restart Verification'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <header className="sticky-header" style={{
                padding: '0.6rem var(--feed-item-padding)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', marginLeft: '-0.5rem' }}
                    className="glass-panel-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Identity Verification</h2>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {step > 1 && (
                        <button 
                            onClick={handleReset}
                            style={{ 
                                background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                padding: '0.4rem 0.8rem', borderRadius: '8px'
                            }}
                            className="glass-panel-hover"
                        >
                            Reset
                        </button>
                    )}
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>Step {step} of 3</div>
                </div>
            </header>

            <div style={{ 
                maxWidth: '600px', 
                width: '100%', 
                margin: '0 auto', 
                padding: '2rem 1rem 6rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                
                {step === 1 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <h3 className="h2" style={{ marginBottom: '0.5rem' }}>Personal Information</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please enter your legal information as it appears on your ID.</p>
                        </div>

                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><User size={14} /> Full Legal Name</label>
                            <input 
                                type="text" 
                                name="full_legal_name"
                                value={formData.full_legal_name}
                                onChange={handleInputChange}
                                placeholder="e.g. John Doe"
                                style={inputStyles}
                            />
                        </div>

                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><Calendar size={14} /> Date of Birth</label>
                            <input 
                                type="date" 
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                style={inputStyles}
                            />
                        </div>

                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><MapPin size={14} /> Residential Address</label>
                            <textarea 
                                name="residential_address"
                                value={formData.residential_address}
                                onChange={handleInputChange}
                                placeholder="Your current home address..."
                                style={{ ...inputStyles, minHeight: '80px', resize: 'none' }}
                            />
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            disabled={!formData.full_legal_name || !formData.date_of_birth || !formData.residential_address}
                            style={{ 
                                padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', 
                                borderRadius: '12px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer',
                                opacity: (!formData.full_legal_name || !formData.date_of_birth || !formData.residential_address) ? 0.5 : 1
                            }}
                        >
                            Next Step
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <h3 className="h2" style={{ marginBottom: '0.5rem' }}>Identity Details</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose your document type and enter the ID number.</p>
                        </div>

                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><ShieldCheck size={14} /> Document Type</label>
                            <select 
                                name="id_type"
                                value={formData.id_type}
                                onChange={handleInputChange}
                                style={inputStyles}
                            >
                                <option>National ID</option>
                                <option>Passport</option>
                                <option>Driver's License</option>
                            </select>
                        </div>

                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><Terminal size={14} /> ID Number</label>
                            <input 
                                type="text" 
                                name="id_number"
                                value={formData.id_number}
                                onChange={handleInputChange}
                                placeholder="ID or Passport Number"
                                style={inputStyles}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button 
                                onClick={() => setStep(1)}
                                style={{ flex: 1, padding: '1rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => setStep(3)}
                                disabled={!formData.id_number}
                                style={{ flex: 2, padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: !formData.id_number ? 0.5 : 1 }}
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <h3 className="h2" style={{ marginBottom: '0.5rem' }}>Supporting Documents</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload clear photos of your documents and yourself.</p>
                        </div>

                        {/* ID Front */}
                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><Upload size={14} /> ID Card Front</label>
                            <div 
                                onClick={() => fileRefs.id_front.current.click()}
                                style={uploadBoxStyles(formData.id_front)}
                            >
                                {previews.id_front ? (
                                    <img src={previews.id_front} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} alt="Preview" />
                                ) : (
                                    <>
                                        <Camera size={24} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.85rem' }}>Take or upload a photo of your ID Front</span>
                                    </>
                                )}
                                <input type="file" ref={fileRefs.id_front} hidden onChange={(e) => handleFileChange(e, 'id_front')} accept="image/*" />
                            </div>
                        </div>

                        {/* Selfie */}
                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><Camera size={14} /> Selfie with ID</label>
                            <div 
                                onClick={() => fileRefs.selfie.current.click()}
                                style={uploadBoxStyles(formData.selfie)}
                            >
                                {previews.selfie ? (
                                    <img src={previews.selfie} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} alt="Preview" />
                                ) : (
                                    <>
                                        <User size={24} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.85rem' }}>Hold your ID next to your face</span>
                                    </>
                                )}
                                <input type="file" ref={fileRefs.selfie} hidden onChange={(e) => handleFileChange(e, 'selfie')} accept="image/*" />
                            </div>
                        </div>

                        {/* Utility Bill */}
                        <div style={inputContainerStyles}>
                            <label style={labelStyles}><FileText size={14} /> Utility Bill (Proof of Address)</label>
                            <div 
                                onClick={() => fileRefs.utility_bill.current.click()}
                                style={uploadBoxStyles(formData.utility_bill)}
                            >
                                {previews.utility_bill ? (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>File Selected: {formData.utility_bill.name}</div>
                                ) : (
                                    <>
                                        <Upload size={24} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.85rem' }}>Electricity, Water, or Internet bill (max 3 months old)</span>
                                    </>
                                )}
                                <input type="file" ref={fileRefs.utility_bill} hidden onChange={(e) => handleFileChange(e, 'utility_bill')} accept="image/*,application/pdf" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button 
                                onClick={() => setStep(2)}
                                style={{ flex: 1, padding: '1rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={submitting || !formData.id_front || !formData.selfie || !formData.utility_bill}
                                style={{ 
                                    flex: 2, padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', 
                                    borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                    opacity: (submitting || !formData.id_front || !formData.selfie || !formData.utility_bill) ? 0.5 : 1
                                }}
                            >
                                {submitting ? 'Submitting...' : 'Finish Verification'}
                            </button>
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
                    </div>
                )}

                {/* Categories Help */}
                {step === 1 && (
                    <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <LifeBuoy size={16} color="var(--primary)" />
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>KYC Required for:</h4>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {['Real Estate', 'Vehicles', 'Jobs', 'Dating', 'Urgent Support'].map(c => (
                                <span key={c} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'var(--bg-base)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>{c}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
