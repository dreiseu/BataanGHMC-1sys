import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

type Props = {
    bioid: string;
    password?: string;
    portalUrl?: string;
    systemName?: string;
};

export default function SsoPortal({ bioid, password, portalUrl = 'https://eportalplus.bataanghmc.net/login', systemName = "Employee's Portal" }: Props) {
    const [ssoStatus, setSsoStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    useEffect(() => {
        if (!bioid || !password) return;

        setSsoStatus('loading');
        
        // 1. Open a microscopic popup window to hide the 100:Success text
        const windowName = 'sso_popup_' + Date.now();

        const form = document.createElement('form');
        form.method = 'POST';
        form.target = windowName;
        
        let targetUrl = portalUrl;
        
        // Ensure we strip index.php from the target URL before appending login endpoints
        if (targetUrl.endsWith('/index.php')) {
            targetUrl = targetUrl.substring(0, targetUrl.length - 10);
        } else if (targetUrl.endsWith('index.php')) {
            targetUrl = targetUrl.substring(0, targetUrl.length - 9);
        }
        
        const nameLower = systemName.toLowerCase();
        
        // Formulate the precise POST endpoint based on the target system architecture
        if (nameLower.includes('1app')) {
            targetUrl = targetUrl.endsWith('/') ? `${targetUrl}includes/login.php` : `${targetUrl}/includes/login.php`;
        } else if (nameLower.includes('ihomp')) {
            targetUrl = targetUrl.endsWith('/') ? `${targetUrl}login.php` : `${targetUrl}/login.php`;
        } else if (nameLower.includes('efms')) {
            targetUrl = targetUrl.endsWith('/') ? `${targetUrl}php/login.php` : `${targetUrl}/php/login.php`;
        } else if (!targetUrl.endsWith('/login') && !targetUrl.includes('login.php')) {
            // Default fallback logic for Employee's Portal
            targetUrl = targetUrl.endsWith('/') ? `${targetUrl}login` : `${targetUrl}/login`;
        }

        // Use the formulated URL
        form.action = targetUrl;

        const fields = [
            { name: 'bioid', value: bioid },
            { name: 'username', value: bioid },
            { name: 'bioUserName', value: bioid },
            { name: 'password', value: password },
            { name: 'pass', value: password },
            { name: 'login', value: 'login' },
            { name: 'loginForm', value: '' }
        ];

        fields.forEach(f => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = f.name;
            input.value = f.value;
            form.appendChild(input);
        });

        document.body.appendChild(form);

        // 2. Decide if we need a hidden popup or direct submit
        const needsPopup = (nameLower.includes('employee') && nameLower.includes('portal')) || nameLower.includes('efms');
        
        if (needsPopup) {
            form.target = windowName;
            const popup = window.open('', windowName, 'width=1,height=1,left=20000,top=20000,menubar=no,toolbar=no,location=no,status=no,titlebar=no,scrollbars=no');
            form.submit();

            // Instantly try to force the popup into the background
            try {
                if (popup) popup.blur();
                window.focus();
            } catch (e) { }

            // 3. Wait for the server to process the login and save the cookie
            setTimeout(() => {
                // Safely close the tiny popup (ignoring cross-origin exceptions)
                try {
                    if (popup && !popup.closed) {
                        popup.close();
                    }
                } catch (e) {
                    try { popup?.close(); } catch (e2) { }
                }

                try {
                    document.body.removeChild(form);
                } catch (e) { }

                // Transition to the success dialog
                setSsoStatus('success');

                // Strip /login or /login.php from the final redirect URL to ensure they hit the dashboard
                let finalRedirectUrl = portalUrl;
                if (finalRedirectUrl.endsWith('/login')) {
                    finalRedirectUrl = finalRedirectUrl.substring(0, finalRedirectUrl.length - 6);
                } else if (finalRedirectUrl.endsWith('/login.php')) {
                    finalRedirectUrl = finalRedirectUrl.substring(0, finalRedirectUrl.length - 10);
                } else if (finalRedirectUrl.endsWith('/index.php')) {
                    finalRedirectUrl = finalRedirectUrl.substring(0, finalRedirectUrl.length - 10);
                }
                
                if (nameLower.includes('efms')) {
                    finalRedirectUrl = finalRedirectUrl.endsWith('/') ? `${finalRedirectUrl}views/job_order.php` : `${finalRedirectUrl}/views/job_order.php`;
                }

                // Give the user 1 second to read the "Proceeding..." text before navigating
                setTimeout(() => {
                    window.location.href = finalRedirectUrl;
                }, 1000);
            }, 1500);
        } else {
            // Direct submission for well-built apps that handle their own redirects (1APP, IHOMP CMS)
            form.target = '_self';
            setSsoStatus('success');
            
            // Give the UI 500ms to show the "Authentication Complete" overlay before the browser navigates away
            setTimeout(() => {
                form.submit();
            }, 500);
        }

    }, [bioid, password]);

    return (
        <>
            <Head title={`Redirecting to ${systemName}`} />

            <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-6 text-center">
                {!bioid || !password ? (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 max-w-md">
                        <h2 className="text-xl font-bold text-destructive">Authentication Error</h2>
                        <p className="mt-2 text-sm text-foreground">
                            We could not retrieve your login credentials to access {systemName}.
                            Please log out and log back into 1SYS, or access the portal manually.
                        </p>
                        <a
                            href={portalUrl}
                            className="mt-4 inline-block rounded-lg bg-[#00D4FF] px-4 py-2 font-bold text-[#0F172A] hover:bg-[#00D4FF]/80 transition-colors"
                        >
                            Go to Portal Manually
                        </a>
                    </div>
                ) : null}
            </div>

            {/* SSO Loading & Success Overlay */}
            {ssoStatus !== 'idle' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center p-8 bg-card rounded-2xl shadow-2xl border border-border w-[350px]">
                        {ssoStatus === 'loading' ? (
                            <>
                                <Loader2 className="h-12 w-12 text-[#00D4FF] animate-spin mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">Unified Access Portal</h3>
                                <p className="text-sm text-muted-foreground mt-1 text-center">Authenticating securely to<br />{systemName}...</p>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">Authentication Complete</h3>
                                <p className="text-sm text-muted-foreground mt-1 text-center mb-4">You have been successfully signed in.</p>
                                <div className="flex items-center text-sm font-medium text-[#00D4FF]">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Proceeding to dashboard...
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
