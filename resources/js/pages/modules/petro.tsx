// import { Head, Link } from '@inertiajs/react';
// import LineWaves from '@/components/ui/linewaves';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//     GraduationCap,
//     BookOpen,
//     FileText,
//     Users,
//     Mail,
//     Phone,
//     MapPin,
//     Globe,
//     Facebook,
//     FileSpreadsheet,
//     Award
// } from 'lucide-react';
// import PETROLogo from '../../../images/petro-removebg-preview.png';
// import DOHLogo from '../../../images/DOH Logo.png';

// export default function PETRO() {

//     const navItems = [
//         "Home", "Training Announcement", "Available Courses",
//         "Internship Report", "Residency Report", "DOH Training Report", "About"
//     ];

//     return (
//         <>
//             <Head title="PETRO" />

//             <div className="p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-8">

//                 {/* Header Card (IMISS Aesthetic) */}
//                 <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-lg">
//                     <div className="absolute inset-0 z-0">
//                         <LineWaves />
//                     </div>
//                     <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#10b981] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
//                     <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-[#1E293B] opacity-40 blur-3xl mix-blend-screen pointer-events-none"></div>

//                     <div className="p-6 md:p-8 relative z-10 border-b border-white/10">
//                         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
//                             <div className="flex items-center gap-5">
//                                 <div className="h-20 w-20 bg-white/10 backdrop-blur-md shadow-sm border border-white/20 p-2 flex items-center justify-center shrink-0 rounded-2xl overflow-hidden">
//                                     <img src={PETROLogo} alt="PETRO" className="h-full w-full object-contain drop-shadow-md" />
//                                 </div>
//                                 <div className="space-y-1">
//                                     <p className="text-sm font-bold tracking-widest text-[#10b981] uppercase drop-shadow-sm flex items-center gap-2">
//                                         <Award className="h-4 w-4" />
//                                         Bataan General Hospital and Medical Center
//                                     </p>
//                                     <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md">
//                                         BataanGHMC <span className="text-[#10b981]">PETRO</span>
//                                     </h1>
//                                     <p className="text-white/80 font-medium">
//                                         Professional Education, Training & Research Office
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Sub-Navigation (Tabs) */}
//                     <div className="bg-black/20 backdrop-blur-md px-6 md:px-8 py-4 relative z-10">
//                         <div className="flex flex-wrap gap-2">
//                             {navItems.map((item, i) => (
//                                 <Button
//                                     key={i}
//                                     variant={item === "Home" ? "default" : "ghost"}
//                                     className={`rounded-full px-5 font-semibold transition-all ${item === "Home"
//                                         ? "bg-[#10b981] text-white shadow-sm hover:bg-[#10b981]/90"
//                                         : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
//                                         }`}
//                                 >
//                                     {item}
//                                 </Button>
//                             ))}
//                         </div>
//                     </div>
//                 </Card>

//                 {/* Hero / Quick Actions */}
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

//                     {/* Hero Card */}
//                     <Card className="lg:col-span-8 overflow-hidden rounded-3xl border-0 shadow-xl relative bg-gradient-to-br from-[#1A365D] via-[#2B5B84] to-[#3a75a7] text-white min-h-[380px] flex flex-col justify-end p-8 sm:p-12 group">
//                         <div className="absolute top-8 right-8 flex gap-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
//                             <GraduationCap className="w-56 h-56 -rotate-12 transform -translate-y-10 translate-x-10" />
//                         </div>
//                         <div className="relative z-10 max-w-2xl space-y-5">
//                             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold shadow-sm">
//                                 <Award className="w-4 h-4 text-amber-400" />
//                                 Excellence in Healthcare Education
//                             </div>
//                             <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-tight">
//                                 Empowering Healthcare Professionals
//                             </h2>
//                             <p className="text-lg sm:text-xl text-blue-100 font-medium max-w-xl leading-relaxed">
//                                 Welcome to the hub of professional development, specialized medical training, and advanced research initiatives at BGHMC.
//                             </p>
//                         </div>
//                     </Card>

//                     {/* Quick Actions Grid */}
//                     <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
//                         {[
//                             { title: "LDNA", icon: FileSpreadsheet, active: true, desc: "Learning Needs Analysis" },
//                             { title: "Trainings", icon: Users, active: false, desc: "Schedules & Modules" },
//                             { title: "Forms", icon: FileText, active: false, desc: "Downloadable resources" },
//                             { title: "Interns Evaluation", icon: GraduationCap, active: false, desc: "Performance tracking" }
//                         ].map((action, i) => (
//                             <button
//                                 key={i}
//                                 className={`text-left h-auto flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 group ${action.active
//                                     ? "border-primary bg-primary/5 hover:bg-primary/10 shadow-sm"
//                                     : "border-border/60 bg-card hover:bg-muted hover:border-border shadow-sm"
//                                     }`}
//                             >
//                                 <div className="flex items-center gap-4 w-full">
//                                     <div className={`p-3.5 rounded-xl transition-transform group-hover:scale-105 ${action.active ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:text-foreground"}`}>
//                                         <action.icon className="w-6 h-6" />
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                         <h3 className={`font-bold text-lg truncate ${action.active ? "text-primary" : "text-foreground"}`}>{action.title}</h3>
//                                         <p className="text-sm text-muted-foreground truncate font-medium mt-0.5">{action.desc}</p>
//                                     </div>
//                                 </div>
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Footer Section */}
//                 <Card className="rounded-3xl border border-border/60 shadow-md bg-card overflow-hidden mt-10 relative">
//                     {/* Subtle background accent */}
//                     <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

//                     <div className="p-8 lg:p-12 relative z-10">
//                         {/* Branding & Social Buttons Row */}
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 pb-8 border-b border-border/50">
//                             <div className="flex items-center gap-5">
//                                 <div className="h-16 w-16 bg-white rounded-full shadow-sm border border-border/60 p-1 flex items-center justify-center shrink-0">
//                                     <img src={DOHLogo} alt="DOH" className="h-full w-full object-contain scale-90" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-xl text-foreground tracking-tight">Department of Health</h3>
//                                     <p className="text-sm text-muted-foreground font-medium mt-0.5">Bataan General Hospital and Medical Center</p>
//                                 </div>
//                             </div>

//                             <div className="flex flex-col sm:flex-row gap-3">
//                                 <Button variant="outline" className="rounded-xl font-bold border-border/60 hover:bg-muted shadow-sm hover:border-[#10b981]/40 hover:text-[#10b981] transition-colors h-11 px-6">
//                                     <Globe className="w-4 h-4 mr-2" /> Visit Website
//                                 </Button>
//                                 <Button variant="outline" className="rounded-xl font-bold border-border/60 hover:bg-muted shadow-sm hover:border-blue-500/40 hover:text-blue-600 transition-colors h-11 px-6">
//                                     <Facebook className="w-4 h-4 mr-2 text-blue-600" /> Facebook Page
//                                 </Button>
//                             </div>
//                         </div>

//                         {/* Contact Information Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             <div className="md:col-span-3 mb-2">
//                                 <p className="text-sm font-bold text-foreground flex items-center gap-3">
//                                     <span className="w-8 h-[2px] bg-[#10b981]/60 block rounded-full"></span>
//                                     Contact & Location
//                                 </p>
//                             </div>

//                             <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 transition-colors hover:bg-muted/70 group">
//                                 <div className="p-3 bg-background shadow-sm rounded-xl border border-border/50 text-[#10b981] shrink-0 group-hover:scale-110 transition-transform">
//                                     <Mail className="w-5 h-5" />
//                                 </div>
//                                 <div className="min-w-0">
//                                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Email</p>
//                                     <p className="text-sm font-bold text-foreground truncate">bghtraining.research@gmail.com</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 transition-colors hover:bg-muted/70 group">
//                                 <div className="p-3 bg-background shadow-sm rounded-xl border border-border/50 text-[#10b981] shrink-0 group-hover:scale-110 transition-transform">
//                                     <Phone className="w-5 h-5" />
//                                 </div>
//                                 <div className="min-w-0">
//                                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Telephone</p>
//                                     <p className="text-sm font-bold text-foreground truncate">237-9772 loc 6710</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 transition-colors hover:bg-muted/70 group">
//                                 <div className="p-3 bg-background shadow-sm rounded-xl border border-border/50 text-[#10b981] shrink-0 group-hover:scale-110 transition-transform">
//                                     <MapPin className="w-5 h-5" />
//                                 </div>
//                                 <div className="min-w-0">
//                                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Location</p>
//                                     <p className="text-sm font-bold text-foreground truncate">New OPD Bldg., 3rd Floor, PETRO</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </Card>

//             </div>
//         </>
//     );
// }