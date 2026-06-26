import { Head, useForm } from '@inertiajs/react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import dohLogoUrl from '../../../images/DOH.png';
import bghmcLogoUrl from '../../../images/BGHMC.png';
import bagongPilipinasLogoUrl from '../../../images/Bagong_Pilipinas.png';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [hasError, setHasError] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        bioid: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
            onError: (errs) => {
                if (errs.bioid) {
                    toast.error(errs.bioid);
                    setHasError(true);
                    setTimeout(() => setHasError(false), 500);
                }
            }
        });
    };

    return (
        <div className="login-page">
            <Head title="Log in" />

            <div className={`shake-wrapper ${hasError ? 'shake-error' : ''}`}>
                <div className="login-card">
                    {/* Top Section */}
                    <div className="login-top">
                        {/* S-Curve SVG */}
                        <svg className="s-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,25 C25,0 75,100 100,50 L100,100 L0,100 Z" fill="white" />
                        </svg>

                        <div className="top-content">
                            <div className="logo-strip">
                                <img src={dohLogoUrl} alt="DOH" />
                                <img src={bghmcLogoUrl} alt="BGHMC" />
                                <img src={bagongPilipinasLogoUrl} alt="Bagong Pilipinas" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="login-bottom">
                        <div className="system-titles">
                            <span className="hospital-name">Bataan General Hospital and Medical Center</span>
                            <h1 className="system-name">
                                All-in-One<br />
                                System
                            </h1>
                            <p className="system-motto">
                                Unified Access Portal

                            </p>
                        </div>

                        <form onSubmit={submit} className="login-form">

                            {/* Biometric ID */}
                            <div className="input-group floating-label">
                                <div className="position-relative">
                                    <span className="input-icon"><User size={20} /></span>
                                    <input
                                        type="text"
                                        id="bioid"
                                        name="bioid"
                                        value={data.bioid}
                                        onChange={(e) => setData('bioid', e.target.value)}
                                        placeholder=" "
                                        required
                                        autoFocus
                                        className={`form-control ${hasError ? 'input-error' : ''}`}
                                    />
                                    <label htmlFor="bioid">Biometric ID / Username</label>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group floating-label">
                                <div className="position-relative">
                                    <span className="input-icon"><Lock size={20} /></span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder=" "
                                        required
                                        className={`form-control password-control ${hasError ? 'input-error' : ''}`}
                                    />
                                    <label htmlFor="password">Password</label>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <div className="button-container">
                                <button
                                    type="submit"
                                    className="btn-login"
                                    disabled={processing}
                                >
                                    {processing ? 'Logging in...' : 'Login'}
                                </button>
                            </div>

                            <div className="login-note">
                                Please use your <b>Employee's Portal</b> account.<br />
                                <div className="mt-1">
                                    <em>Can't login? Please contact IMISS via local number (1114)</em>
                                </div>
                            </div>

                            <div className="login-footer">
                                <p>Philippine Copyright &copy; 2018 Dr. Glory V. Baltazar</p>
                                <p>App Code: 1SYS</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
}


Login.layout = null;
