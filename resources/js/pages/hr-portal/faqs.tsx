import ModulePageHeader from '@/components/module-page-header';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Head } from '@inertiajs/react';

const faqs = [
    {
        question: 'How do I file for leave?',
        answer: 'Use the leave application form and submit it through the HR office.',
    },
    {
        question: 'How do I request a certificate of employment?',
        answer: 'Submit the request form available under Downloadable Forms.',
    },
    {
        question: 'Where can I find HR policies?',
        answer: 'Go to the Policies & Memoranda section of the HR Portal.',
    },
];

export default function Faqs() {
    return (
        <>
            <Head title="FAQs" />

            <div className="p-6">
                <ModulePageHeader
                    title="Frequently Asked Questions"
                    description="Common questions related to HR processes."
                />

                <Accordion
                    type="single"
                    collapsible
                    className="rounded-2xl border bg-card shadow-sm overflow-hidden"
                >
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={faq.question}
                            value={`item-${index}`}
                            className="px-6 border-b last:border-0 hover:bg-[#1E293B]/5 transition-colors"
                        >
                            <AccordionTrigger className="py-5 text-left font-semibold text-foreground hover:text-[#1E293B] hover:no-underline transition-colors">
                                {faq.question}
                            </AccordionTrigger>

                            <AccordionContent className="pb-5 text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </>
    );
}