import { Head, Link } from '@inertiajs/react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import LineWaves from '@/components/ui/linewaves';
import { BookOpen, HelpCircle, MonitorSmartphone, ShieldCheck, Ticket, Users, FileText, Activity } from 'lucide-react';

export default function UserGuide() {
    return (
        <>
            <Head title="User Guide" />

            <div className="flex flex-col gap-8 p-6 mt-6 mx-auto w-full max-w-7xl">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 sm:p-12 shadow-lg min-h-[250px] flex flex-col justify-center">
                    <div className="absolute inset-0 z-0">
                        <LineWaves />
                    </div>
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-indigo-500 opacity-30 blur-3xl mix-blend-screen pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <p className="text-sm font-bold tracking-widest text-blue-400 uppercase drop-shadow-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Help & Documentation
                        </p>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-md">
                            1SYS User Guide
                        </h1>
                        <p className="mt-4 text-lg text-white/90 leading-relaxed font-medium">
                            Welcome to the EMR+ ecosystem. This guide will walk you through navigating the platform, accessing hospital systems, and getting support when you need it.
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Accordion */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-card rounded-3xl border shadow-sm p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <HelpCircle className="w-48 h-48" />
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2 relative z-10">
                                <MonitorSmartphone className="h-6 w-6 text-blue-500" />
                                How to Use the System
                            </h2>

                            <Accordion type="single" collapsible className="w-full relative z-10">
                                <AccordionItem value="item-1" className="border-b-muted/50 py-2">
                                    <AccordionTrigger className="cursor-pointer text-left font-semibold text-base hover:text-blue-600 transition-colors">
                                        Navigating the Sidebar & Dashboard
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2 pb-4 space-y-3">
                                        <p>
                                            The left sidebar is your main navigation hub. From here, you can access your pinned systems, hospital services, and utility settings.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Use the <strong>Search Bar</strong> at the top of the sidebar to quickly find any module.</li>
                                            <li>Your <strong>Dashboard</strong> provides a centralized view of your pinned applications. You can pin and unpin items directly from the Systems page.</li>
                                            <li>You can collapse the sidebar using the toggle button at the bottom for a wider workspace.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2" className="border-b-muted/50 py-2">
                                    <AccordionTrigger className="cursor-pointer text-left font-semibold text-base hover:text-blue-600 transition-colors">
                                        Accessing Hospital Systems (SSO)
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2 pb-4 space-y-3">
                                        <p>
                                            1SYS features Single Sign-On (SSO) capabilities. Once you are logged into 1SYS, you do not need to log in again to access most internal portals.
                                        </p>
                                        <p>
                                            Navigate to the <strong>Systems</strong> menu in the sidebar and click on the portal you wish to open (e.g., 1APP, iHOMP CMS). The system will securely authenticate you in the background and redirect you to the application's dashboard.
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3" className="border-b-muted/50 py-2">
                                    <AccordionTrigger className="cursor-pointer text-left font-semibold text-base hover:text-blue-600 transition-colors">
                                        Requesting IT Support (IMISS)
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2 pb-4 space-y-3">
                                        <p>
                                            If you encounter any hardware, software, or network issues, you can submit a Job Order Request directly through the <strong>IMISS Ticket System</strong>. Our technicians will review and process your request as quickly as possible.
                                        </p>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <h4 className="font-bold text-foreground mb-2">How to Submit a Ticket:</h4>
                                            <ol className="list-decimal pl-5 space-y-2">
                                                <li>Navigate to the <strong>Services &gt; IMISS</strong> page from the left sidebar.</li>
                                                <li>Click the <span className="font-semibold text-foreground">"Submit a New Ticket"</span> button at the top right of the page.</li>
                                                <li>Select the appropriate <strong>Request Type</strong> (e.g., Hardware Repair, Network Connectivity, Software Installation, EMR Records).</li>
                                                <li>Fill out the form with your exact location, local number, and a detailed description of the problem.</li>
                                                <li>Set the <strong>Priority</strong> level (Normal, High, or Critical).</li>
                                                <li><em>(Optional)</em> Attach any relevant screenshots or error messages to help diagnose the issue.</li>
                                                <li>Click <span className="font-semibold text-foreground">"Submit Request"</span>.</li>
                                            </ol>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mt-3">
                                            <h4 className="font-bold text-foreground mb-2">Tracking Your Ticket:</h4>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li>Once submitted, your ticket will appear in your <strong>Active Tickets</strong> list with the status "Ticket Submitted".</li>
                                                <li>You can click on your ticket to view the live status, see the assigned technician, and use the <strong>Ticket Communication</strong> chat to send updates or additional files.</li>
                                                <li>When the issue is resolved, the admin will mark it as "Accomplished". You can then choose to "Mark Resolved" to close the ticket or "Return for Correction" if the issue persists.</li>
                                            </ul>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>

                    {/* Right Column - Quick Links & Support */}
                    <div className="flex flex-col gap-6">
                        {/* Support Card */}
                        {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <ShieldCheck className="h-5 w-5" />
                                Need Immediate Help?
                            </h3>
                            <p className="text-sm text-blue-900/70 dark:text-blue-200/70 mb-4 leading-relaxed">
                                If you are experiencing a critical system failure, please reach out directly to the IMISS hotlines.
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <span className="text-sm font-semibold">Technical Support</span>
                                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md text-xs">Local 1115</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <span className="text-sm font-semibold">Programmers</span>
                                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md text-xs">Local 1114</span>
                                </div>
                            </div>
                        </div> */}

                        {/* Quick Links */}
                        <div className="bg-card rounded-3xl border p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                            <div className="grid gap-3">
                                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-colors group">
                                    <div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 transition-colors">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm group-hover:text-blue-600 transition-colors">Your Dashboard</div>
                                        <div className="text-xs text-muted-foreground">Access your pinned apps</div>
                                    </div>
                                </Link>

                                <Link href="/imiss" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-colors group">
                                    <div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 transition-colors">
                                        <Ticket className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">Submit a Ticket</div>
                                        <div className="text-xs text-muted-foreground">Report an issue to IMISS</div>
                                    </div>
                                </Link>

                                <Link href="/hr-portal" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-colors group">
                                    <div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-950/50 group-hover:text-purple-600 transition-colors">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm group-hover:text-purple-600 transition-colors">HR Portal</div>
                                        <div className="text-xs text-muted-foreground">View policies & forms</div>
                                    </div>
                                </Link>

                                <Link href="/directory" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-colors group">
                                    <div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-600 transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm group-hover:text-emerald-600 transition-colors">Hospital Directory</div>
                                        <div className="text-xs text-muted-foreground">Find contact information</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}