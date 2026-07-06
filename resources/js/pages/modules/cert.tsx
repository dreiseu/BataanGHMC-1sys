import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, PhoneCall, MonitorX, Globe, Lock, ShieldCheck } from 'lucide-react';
import IMISSLogo from '../../../images/IMISS_Official Logo.png';
import BGHMCLogo from '../../../images/BGHMC_Logo_Compressed.png';

export default function Cert() {
    return (
        <>
            <Head title="BataanGHMC-CERT" />

            {/* Sticky Watermark Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="sticky top-0 h-[100dvh] w-full flex items-center justify-center opacity-[0.04]">
                    <img src={IMISSLogo} alt="Background Watermark" className="w-[70vw] max-w-[800px] object-contain grayscale" />
                </div>
            </div>

            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-16 relative z-10">

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-6">
                    <div className="space-y-6">
                        <blockquote className="text-4xl md:text-5xl lg:text-[54px] font-black leading-tight text-foreground tracking-tight">
                            "<span className="text-red-600">Cybersecurity</span> is a shared <span className="text-red-600">responsibility</span>, and it boils down to this: in cybersecurity, the more systems we secure, the more secure we all are."
                        </blockquote>
                        <p className="text-xl font-medium text-muted-foreground border-l-4 border-red-600 pl-4">
                            - Jeh Johnson
                        </p>
                    </div>

                    {/* Google Slides Embed */}
                    <div className="w-full max-w-[600px] mx-auto aspect-[4/3] sm:aspect-video lg:aspect-[4/3] shadow-2xl rounded-xl overflow-hidden border border-border bg-black/5 relative group">

                        {/* 
                          ⚠️ REPLACE THIS SRC ⚠️
                          Replace the `src` attribute below with your actual Google Slides "Publish to the web" embed URL. 
                          To get it: Open your Google Slide -> File -> Share -> Publish to web -> Embed -> Copy the src link.
                        */}
                        <iframe
                            src="about:blank"
                            frameBorder="0"
                            width="100%"
                            height="100%"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0 z-10"
                        ></iframe>

                        {/* Placeholder Content (will be hidden behind the iframe once a valid src is provided) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center z-0">
                            <ShieldCheck className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-bold text-lg">Unavailable</p>
                            <p className="text-sm opacity-80 mt-2">Please contact IMISS for more information.</p>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Best Practices */}
                <div className="space-y-10 pt-4">
                    <h2 className="text-3xl md:text-5xl font-black text-center tracking-tight">
                        Cybersecurity <span className="text-green-700">Awareness</span> Best Practices
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-sm sm:text-base">
                        {[
                            { title: "Think Before Clicking", desc: "Avoid clicking on unknown links or downloading files from unfamiliar sources." },
                            { title: "Update Regularly", desc: "Keep your software, operating system, and antivirus programs up to date to patch vulnerabilities." },
                            { title: "Use Strong Passwords", desc: "Create complex passwords and update them regularly for enhanced security." },
                            { title: "Secure Your USB", desc: "Avoid using unknown or untrusted USB devices." },
                            { title: "Beware of Phishing", desc: "Be cautious of unexpected emails or messages requesting personal information. Verify the sender's authenticity." },
                            { title: "Enable Two-Factor Authentication (2FA)", desc: "Add an extra layer of protection by using 2FA whenever possible." },
                            { title: "Lock Your Device", desc: "Always lock your computer or mobile device when not in use to prevent unauthorized access." },
                            { title: "Backup Data", desc: "Regularly backup important data to avoid losing it in case of ransomware attacks or hardware failures." },
                            { title: "Keep Personal Information Private", desc: "Be cautious about sharing personal information online and limit the data you disclose." },
                            { title: "Educate Yourself", desc: "Stay informed about common cyber threats and best practices for cybersecurity." },
                            { title: "Report Suspicious Activity", desc: "If you notice anything unusual or suspect a security issue, report it to IHOMP." },
                            { title: "Be Skeptical", desc: "Verify the legitimacy of unexpected requests for sensitive information before responding." },
                            { title: "Review Privacy Settings", desc: "Regularly review and update privacy settings on your devices and online accounts." },
                            { title: "Think About Physical Security", desc: "Keep devices physically secure and be mindful of where you leave them." },
                            { title: "Log Out Completely", desc: "Always log out of applications and websites after use, especially on shared or public computers." }
                        ].map((item, index) => (
                            <div key={index} className="cursor-pointer flex gap-3 items-start p-3 hover:bg-muted/100 rounded-xl transition-colors">
                                <span className="font-black text-lg text-muted-foreground/40 w-6 shrink-0 pt-0.5">{index + 1}.</span>
                                <p className="leading-relaxed">
                                    <strong className="text-foreground block mb-0.5">{item.title}</strong>
                                    <span className="text-muted-foreground">{item.desc}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                    {/* Card 1 */}
                    <div className="border-2 border-gray-100 bg-white shadow-sm flex flex-col">
                        <div className="bg-black text-white px-5 py-3.5 flex items-center justify-between">
                            <h3 className="font-bold text-lg tracking-tight">If You Suspect a Computer System Incident</h3>
                            <div className="flex items-center gap-2 text-xs text-white/90">
                                <span>Cybersecurity</span>
                                <div className="h-6 w-6 bg-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                                    <img src={BGHMCLogo} alt="BGHMC" className="h-full w-full object-contain" />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 space-y-8 text-black flex-1 relative z-10">
                            <p className="text-lg leading-relaxed font-medium">
                                If an end user identifies <strong className="text-red-600 font-bold">unusual activities</strong> such as unauthorized remote access, persistent pop-up messages, unknown applications, or any abnormal notifications on their monitor:
                            </p>
                            <ul className="space-y-6 text-lg leading-relaxed font-medium pl-2">
                                <li className="flex gap-4 items-start">
                                    <span className="text-red-600 text-3xl leading-none -mt-1">&bull;</span>
                                    <span>
                                        <strong className="text-red-600">Shutdown</strong> or <strong className="text-red-600">unplugged</strong> your computer immediately!
                                    </span>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-red-600 text-3xl leading-none -mt-1">&bull;</span>
                                    <span>
                                        <strong className="text-red-600">Notify</strong> your immediate supervisor and IHOMP at once.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="border-2 border-gray-100 bg-white shadow-sm flex flex-col">
                        <div className="bg-black text-white px-5 py-3.5 flex items-center justify-between">
                            <h3 className="font-bold text-lg tracking-tight">Report Suspicious Computer Problems</h3>
                            <div className="flex items-center gap-2 text-xs text-white/90">
                                <span>Cybersecurity</span>
                                <div className="h-6 w-6 bg-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                                    <img src={BGHMCLogo} alt="BGHMC" className="h-full w-full object-contain" />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-8 flex-1 relative z-10">
                            <h4 className="text-4xl sm:text-[42px] font-black text-red-600 leading-tight tracking-tight">
                                If your computer system acts unusual!
                            </h4>

                            <div className="space-y-3 pt-4">
                                <p className="text-2xl sm:text-[28px] font-bold text-[#60a5fa] drop-shadow-sm">Report immediately to IHOMP!</p>
                                <p className="text-4xl sm:text-[46px] font-black text-[#60a5fa] tracking-tight drop-shadow-sm">Dial Local: 1114/1115</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 pb-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        &copy; 2023 BGHMC-CERT. All Rights Reserved
                    </p>
                </div>

            </div>
        </>
    );
}