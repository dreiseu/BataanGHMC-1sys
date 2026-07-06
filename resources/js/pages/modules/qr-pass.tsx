import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Printer, Share2, Loader2, Maximize2 } from 'lucide-react';
import LineWaves from '@/components/ui/linewaves';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function QrPass() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [loading, setLoading] = useState(true);
    const [passes, setPasses] = useState<any[]>([]);

    // Modal State
    const [selectedPass, setSelectedPass] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (pass: any) => {
        setSelectedPass(pass);
        setIsModalOpen(true);
    };

    // Actions
    const handleDownloadAll = () => {
        if (passes.length === 0) return;
        toast.info(`Downloading ${passes.length} QR passes...`);
        passes.forEach((pass, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = pass.qrImageBase64;
                link.download = `${pass.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 300);
        });
    };

    const handlePrint = (pass: any) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Pass - ${pass.id}</title>
                        <style>
                            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                            .print-card { border: 2px dashed #ccc; padding: 40px; border-radius: 20px; text-align: center; }
                            img { width: 300px; height: 300px; margin-bottom: 20px; }
                            h1 { font-size: 28px; margin: 0 0 10px 0; color: #111; }
                            p { font-size: 18px; color: #555; margin: 0; letter-spacing: 2px; }
                            @media print { .print-card { border: none; } }
                        </style>
                    </head>
                    <body>
                        <div class="print-card">
                            <img src="${pass.qrImageBase64}" />
                            <h1>${pass.title}</h1>
                            <p>${pass.id}</p>
                        </div>
                        <script>
                            window.onload = () => { window.print(); window.close(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleShare = async (pass: any) => {
        try {
            // Attempt to convert base64 to file and share natively (Works well on Mobile/MacOS)
            const fetchRes = await fetch(pass.qrImageBase64);
            const blob = await fetchRes.blob();
            const file = new File([blob], `${pass.id}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: pass.title,
                    text: `Official BataanGHMC QR Pass: ${pass.id}`,
                    files: [file]
                });
            } else {
                // Fallback for Desktop: Copy ID to clipboard
                await navigator.clipboard.writeText(pass.id);
                toast.success('Pass ID copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing', error);
            // Ignore abort errors from the user canceling the share sheet
        }
    };

    useEffect(() => {
        if (!user?.bioid) {
            setLoading(false);
            return;
        }

        const fetchQR = async () => {
            try {
                // Fetch securely through our Laravel proxy to bypass browser CORS policy
                const response = await fetch(`/api/qr-pass-proxy?bioID=${user.bioid}`);
                const data = await response.json();

                if (data.status === 'success' && data.qrCodes && data.qrCodes.length > 0) {
                    const mappedPasses = data.qrCodes.map((qrCode: any, index: number) => {
                        // Clean the base64 string as requested by the legacy script
                        const cleanImageData = qrCode.QRImage.replace(/[^\x20-\x7E]/g, '');
                        return {
                            id: qrCode.QRText || `QR-PASS-${index + 1}`,
                            title: 'Parking QR Code',
                            description: 'Official parking QR pass assigned to your biometric ID.',
                            qrImageBase64: `data:image/png;base64,${cleanImageData}`
                        };
                    });
                    setPasses(mappedPasses);
                }
            } catch (error) {
                console.error("Failed to fetch QR codes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQR();
    }, [user]);

    return (
        <>
            <Head title="My QR Passes" />

            <div className="p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto space-y-8">

                {/* Header Banner */}
                <Card className="relative overflow-hidden rounded-[2rem] border-0 shadow-lg bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
                        <LineWaves />
                    </div>
                    {/* Background accents */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="p-8 lg:p-12 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 bg-sky-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-sky-400/20 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                                <QrCode className="w-10 h-10 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md">Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">QR Passes</span></h1>
                                <p className="text-slate-300 font-medium mt-2 text-sm md:text-base max-w-xl">
                                    Manage and present your official BataanGHMC digital passes securely.
                                </p>
                            </div>
                        </div>
                        <Button
                            className="cursor-pointer rounded-xl h-12 px-6 font-bold shadow-lg bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] transition-transform"
                            disabled={passes.length === 0}
                            onClick={handleDownloadAll}
                        >
                            <Download className="w-4 h-4 mr-2" /> Download All
                        </Button>
                    </div>
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-4" />
                        <p className="font-semibold">Retrieving your secure passes...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && passes.length === 0 && (
                    <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2 bg-muted/10 shadow-none rounded-[2rem]">
                        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <QrCode className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No QR Passes Found</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            We couldn't find any digital passes associated with your Biometric ID ({user?.bioid || 'N/A'}).
                        </p>
                    </Card>
                )}

                {/* QR Pass Grid */}
                {!loading && passes.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {passes.map((pass) => (
                            <Card key={pass.id} className="overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group bg-card flex flex-row">
                                {/* Left Side - QR Code */}
                                <div className="p-4 md:p-5 flex flex-col items-center justify-center border-r border-border/40 min-w-[160px]">
                                    <div
                                        className="bg-white p-2.5 rounded-xl shadow-sm border border-border/50 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                        onClick={() => openModal(pass)}
                                        title="Click to enlarge"
                                    >
                                        <img
                                            src={pass.qrImageBase64}
                                            alt={pass.title}
                                            className="w-24 h-24 md:w-28 md:h-28 object-contain"
                                        />
                                    </div>
                                    <p className="text-[10px] md:text-xs font-bold text-foreground/80 tracking-widest uppercase mt-4 text-center">{pass.id}</p>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground/70 mt-1 flex items-center justify-center gap-1">
                                        <Maximize2 className="w-3 h-3" /> Click to enlarge
                                    </p>
                                </div>

                                {/* Right Side - Details */}
                                <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
                                    <div>
                                        <Badge variant="outline" className="mb-2 bg-background text-muted-foreground border-border text-[10px] shadow-none h-5 px-2">
                                            <QrCode className="w-3 h-3 mr-1" /> ID PASS
                                        </Badge>
                                        <h3 className="font-bold text-base md:text-lg text-foreground leading-tight line-clamp-1">{pass.title}</h3>
                                        <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {pass.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="cursor-pointer flex-1 h-8 text-xs font-semibold shadow-sm"
                                            onClick={() => handlePrint(pass)}
                                        >
                                            <Printer className="w-3 h-3 mr-1.5 text-muted-foreground" /> Print
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="cursor-pointer flex-1 h-8 text-xs font-semibold shadow-sm"
                                            onClick={() => handleShare(pass)}
                                        >
                                            <Share2 className="w-3 h-3 mr-1.5 text-muted-foreground" /> Share
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Full Size QR Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md flex flex-col items-center p-8 bg-card rounded-[2rem] border-border/50">
                        <DialogHeader className="text-center w-full mb-2">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{selectedPass?.title}</DialogTitle>
                            <DialogDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">
                                {selectedPass?.id}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 w-full flex items-center justify-center my-2">
                            <img
                                src={selectedPass?.qrImageBase64}
                                alt={selectedPass?.title}
                                className="w-64 h-64 md:w-80 md:h-80 object-contain"
                            />
                        </div>

                        <p className="text-sm text-center text-muted-foreground leading-relaxed mt-2">
                            {selectedPass?.description}
                        </p>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}