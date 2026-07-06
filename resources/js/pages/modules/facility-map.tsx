import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
    Building2,
    Search,
    Map,
    MapPin,
    Users,
    Stethoscope,
    Pill,
    Bed,
    Ambulance,
    HeartPulse,
    Syringe,
    Microscope,
    ChevronRight,
} from 'lucide-react';

interface Department {
    id: string;
    name: string;
    floor: string;
    zone: string;
    room: string;
    phone: string;
    hours: string;
    description: string;
    category: 'medical' | 'support' | 'admin' | 'emergency' | 'ancillary';
    icon: any;
}

const DEPARTMENTS: Department[] = [
    // Ground Floor
    { id: 'er', name: 'Emergency Room', floor: 'Ground', zone: 'A', room: 'G-001', phone: 'Local 1101', hours: '24/7', description: 'Emergency medical services for critical and urgent cases.', category: 'emergency', icon: Ambulance },
    { id: 'opd', name: 'Outpatient Department', floor: 'Ground', zone: 'A', room: 'G-002', phone: 'Local 1102', hours: '6:00 AM - 6:00 PM', description: 'Consultations and outpatient services.', category: 'medical', icon: Users },
    { id: 'pharmacy', name: 'Pharmacy', floor: 'Ground', zone: 'B', room: 'G-010', phone: 'Local 1110', hours: '6:00 AM - 8:00 PM', description: 'In-house pharmacy for prescribed medications.', category: 'ancillary', icon: Pill },
    { id: 'radiology', name: 'Radiology', floor: 'Ground', zone: 'B', room: 'G-011', phone: 'Local 1111', hours: '7:00 AM - 7:00 PM', description: 'X-ray, ultrasound, CT scan, and MRI services.', category: 'ancillary', icon: Stethoscope },
    { id: 'lab', name: 'Laboratory', floor: 'Ground', zone: 'B', room: 'G-012', phone: 'Local 1112', hours: '6:00 AM - 8:00 PM', description: 'Clinical laboratory and diagnostic testing.', category: 'ancillary', icon: Microscope },

    // 2nd Floor
    { id: 'icu', name: 'Intensive Care Unit', floor: '2nd', zone: 'C', room: '2-001', phone: 'Local 1201', hours: '24/7', description: 'Critical care unit for seriously ill patients.', category: 'medical', icon: HeartPulse },
    { id: 'nursing', name: 'Nursing Station', floor: '2nd', zone: 'C', room: '2-002', phone: 'Local 1202', hours: '24/7', description: 'Main nursing station for patient care coordination.', category: 'medical', icon: Syringe },
    { id: 'nicu', name: 'NICU', floor: '2nd', zone: 'D', room: '2-010', phone: 'Local 1210', hours: '24/7', description: 'Neonatal Intensive Care Unit.', category: 'medical', icon: Bed },

    // 3rd Floor
    { id: 'or', name: 'Operating Room', floor: '3rd', zone: 'E', room: '3-001', phone: 'Local 1301', hours: '24/7', description: 'Surgical suites for major and minor procedures.', category: 'medical', icon: Stethoscope },
    { id: 'dr', name: 'Delivery Room', floor: '3rd', zone: 'E', room: '3-002', phone: 'Local 1302', hours: '24/7', description: 'Maternity and childbirth services.', category: 'medical', icon: HeartPulse },
    { id: 'pedia', name: 'Pediatrics Ward', floor: '3rd', zone: 'F', room: '3-010', phone: 'Local 1310', hours: '24/7', description: 'In-patient care for children.', category: 'medical', icon: Bed },

    // 4th Floor
    { id: 'admin', name: 'Hospital Administration', floor: '4th', zone: 'G', room: '4-001', phone: 'Local 1401', hours: '8:00 AM - 5:00 PM', description: 'Office of the Hospital Director and administrative staff.', category: 'admin', icon: Building2 },
    { id: 'hr', name: 'Human Resources', floor: '4th', zone: 'G', room: '4-002', phone: 'Local 1402', hours: '8:00 AM - 5:00 PM', description: 'HR office for employee-related concerns.', category: 'admin', icon: Users },
    { id: 'finance', name: 'Finance / Billing', floor: '4th', zone: 'G', room: '4-003', phone: 'Local 1403', hours: '8:00 AM - 5:00 PM', description: 'Billing, payments, and financial services.', category: 'admin', icon: Building2 },
    { id: 'imiss', name: 'IMISS Office', floor: '4th', zone: 'H', room: '4-010', phone: 'Local 1410', hours: '7:00 AM - 5:00 PM', description: 'Information Management and Information Systems Section.', category: 'support', icon: Building2 },

    // Other
    { id: 'dietary', name: 'Dietary / Cafeteria', floor: 'Ground', zone: 'C', room: 'G-020', phone: 'Local 1120', hours: '6:00 AM - 7:00 PM', description: 'Hospital cafeteria and dietary services.', category: 'support', icon: Building2 },
    { id: 'chapel', name: 'Hospital Chapel', floor: 'Ground', zone: 'A', room: 'G-030', phone: '-', hours: 'Open 24/7', description: 'Multi-faith prayer room.', category: 'support', icon: Building2 },
];

const FLOORS = ['Ground', '2nd', '3rd', '4th'];

const FLOOR_GRID: Record<string, { zone: string; row: number; col: number; rowSpan: number; colSpan: number; label: string; color: string }[]> = {
    'Ground': [
        { zone: 'A', row: 0, col: 0, rowSpan: 2, colSpan: 2, label: 'Emergency & OPD', color: 'bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-800' },
        { zone: 'B', row: 0, col: 2, rowSpan: 2, colSpan: 2, label: 'Diagnostics (Pharmacy, Lab, X-ray)', color: 'bg-blue-100 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800' },
        { zone: 'C', row: 0, col: 4, rowSpan: 1, colSpan: 2, label: 'Dietary / Cafeteria', color: 'bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800' },
        { zone: 'C2', row: 1, col: 4, rowSpan: 1, colSpan: 2, label: 'Chapel', color: 'bg-purple-100 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800' },
    ],
    '2nd': [
        { zone: 'C', row: 0, col: 0, rowSpan: 2, colSpan: 3, label: 'ICU / Critical Care', color: 'bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-800' },
        { zone: 'D', row: 0, col: 3, rowSpan: 2, colSpan: 3, label: 'NICU / Pediatrics Ward', color: 'bg-pink-100 border-pink-300 dark:bg-pink-950/40 dark:border-pink-800' },
    ],
    '3rd': [
        { zone: 'E', row: 0, col: 0, rowSpan: 2, colSpan: 3, label: 'Operating & Delivery Rooms', color: 'bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-800' },
        { zone: 'F', row: 0, col: 3, rowSpan: 2, colSpan: 3, label: 'Pediatrics Ward', color: 'bg-cyan-100 border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-800' },
    ],
    '4th': [
        { zone: 'G', row: 0, col: 0, rowSpan: 2, colSpan: 4, label: 'Administration Offices', color: 'bg-slate-100 border-slate-300 dark:bg-slate-950/40 dark:border-slate-800' },
        { zone: 'H', row: 0, col: 4, rowSpan: 2, colSpan: 2, label: 'IMISS Office', color: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800' },
    ],
};

export default function FacilityMap() {
    const [activeFloor, setActiveFloor] = useState('Ground');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const filteredDepartments = useMemo(() => {
        if (!searchQuery.trim()) return DEPARTMENTS;
        const q = searchQuery.toLowerCase();
        return DEPARTMENTS.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.floor.toLowerCase().includes(q) ||
                d.room.toLowerCase().includes(q) ||
                d.category.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const floorDepartments = useMemo(() => {
        return filteredDepartments.filter((d) => d.floor === activeFloor);
    }, [filteredDepartments, activeFloor]);

    const handleDepartmentClick = (dept: Department) => {
        setSelectedDept(dept);
        setDialogOpen(true);
    };

    return (
        <>
            <Head title="Facility Map & Directory" />

            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                {/* ==================== HERO HEADER ==================== */}
                <Card className="relative overflow-hidden rounded-3xl border border-border/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-lg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl mix-blend-screen" />
                        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen" />
                    </div>
                    <div className="p-6 md:p-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg flex items-center justify-center shrink-0">
                                <Map className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0 text-xs font-semibold px-3 py-1">
                                    Hospital Guide
                                </Badge>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                    Facility <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Map</span>
                                </h1>
                                <p className="text-white/70 text-base font-medium max-w-lg">
                                    Navigate the hospital easily. Find departments, offices, and services by floor.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* ==================== LEFT: MAP ==================== */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                            {/* Floor Tabs */}
                            <div className="flex border-b border-border/40 bg-muted/20">
                                {FLOORS.map((floor) => (
                                    <button
                                        key={floor}
                                        onClick={() => setActiveFloor(floor)}
                                        className={`flex-1 text-center py-3 px-4 text-sm font-bold transition-all ${activeFloor === floor
                                            ? 'bg-background text-foreground border-b-2 border-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                            }`}
                                    >
                                        {floor} Floor
                                    </button>
                                ))}
                            </div>

                            {/* Floor Grid */}
                            <div className="p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        {activeFloor} Floor Layout
                                    </h3>
                                    <Badge variant="outline" className="text-xs font-semibold rounded-full">
                                        {floorDepartments.length} {floorDepartments.length === 1 ? 'dept' : 'depts'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-6 gap-3 auto-rows-[80px] md:auto-rows-[100px]">
                                    {FLOOR_GRID[activeFloor]?.map((zone) => (
                                        <button
                                            key={zone.zone}
                                            style={{
                                                gridRow: `${zone.row + 1} / span ${zone.rowSpan}`,
                                                gridColumn: `${zone.col + 1} / span ${zone.colSpan}`,
                                            }}
                                            onClick={() => {
                                                const depts = floorDepartments.filter((d) => d.zone === zone.zone.replace(/\d/, ''));
                                                if (depts.length > 0) handleDepartmentClick(depts[0]);
                                            }}
                                            className={`rounded-xl border-2 ${zone.color} flex flex-col items-center justify-center p-2 text-center transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer`}
                                        >
                                            <span className="text-[10px] md:text-xs font-bold text-foreground leading-tight">
                                                {zone.label}
                                            </span>
                                            <span className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5">
                                                Zone {zone.zone.replace(/\d/, '')}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3 text-[10px] md:text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 dark:bg-red-950" /> Emergency</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-950" /> Diagnostics</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 dark:bg-green-950" /> Surgery</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-950" /> Admin</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-950" /> Support</span>
                                </div>
                            </div>
                        </Card>

                        {/* Floor Departments List */}
                        <Card className="rounded-2xl border-border/60 shadow-sm">
                            <div className="p-4 border-b border-border/40 bg-muted/20">
                                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                    Departments on {activeFloor} Floor
                                </h3>
                            </div>
                            <div className="divide-y divide-border/30">
                                {floorDepartments.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        No departments found on this floor.
                                    </div>
                                ) : (
                                    floorDepartments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => handleDepartmentClick(dept)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors text-left"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                                <dept.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{dept.name}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Room {dept.room} &middot; {dept.phone}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* ==================== RIGHT: SEARCH & DIRECTORY ==================== */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Search */}
                        <Card className="rounded-2xl border-border/60 shadow-sm">
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search department, room, floor..."
                                        className="pl-9 h-10 rounded-xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Quick Filters */}
                        <div className="flex flex-wrap gap-2">
                            {['all', 'medical', 'emergency', 'ancillary', 'admin', 'support'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        if (cat === 'all') setSearchQuery('');
                                        else setSearchQuery(cat);
                                    }}
                                    className="text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full transition-all bg-muted text-muted-foreground hover:bg-muted/80"
                                >
                                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Department Directory */}
                        <Card className="rounded-2xl border-border/60 shadow-sm">
                            <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-500" />
                                    Full Directory
                                </h3>
                                <Badge variant="secondary" className="text-[10px] font-semibold rounded-full">
                                    {filteredDepartments.length}
                                </Badge>
                            </div>
                            <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
                                {filteredDepartments.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        No departments match your search.
                                    </div>
                                ) : (
                                    filteredDepartments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => handleDepartmentClick(dept)}
                                            className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/40 transition-colors text-left"
                                        >
                                            <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                                <dept.icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{dept.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {dept.floor} Floor &middot; Room {dept.room}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-semibold rounded-full px-2 py-0 capitalize">
                                                {dept.category}
                                            </Badge>
                                        </button>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ==================== DEPARTMENT DETAIL DIALOG ==================== */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-2xl">
                        {selectedDept && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <selectedDept.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg font-bold">{selectedDept.name}</DialogTitle>
                                            <DialogDescription className="text-xs">
                                                {selectedDept.floor} Floor &middot; Zone {selectedDept.zone} &middot; Room {selectedDept.room}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">{selectedDept.description}</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                                            <p className="text-sm font-bold text-foreground">{selectedDept.phone}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hours</p>
                                            <p className="text-sm font-bold text-foreground">{selectedDept.hours}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="secondary" className="text-[10px] font-semibold rounded-full capitalize">
                                            {selectedDept.category}
                                        </Badge>
                                        <span>&middot;</span>
                                        <span>Floor: {selectedDept.floor}</span>
                                        <span>&middot;</span>
                                        <span>Zone: {selectedDept.zone}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ==================== FOOTER ==================== */}
                <Separator className="my-4" />
                <p className="text-center text-xs text-muted-foreground font-medium pb-6">
                    Find your way around BataanGHMC &mdash; Facility Map & Directory
                </p>
            </div>
        </>
    );
}