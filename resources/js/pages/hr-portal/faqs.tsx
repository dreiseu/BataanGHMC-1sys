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
                    className="rounded-xl border bg-card"
                >
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={faq.question}
                            value={`item-${index}`}
                            className="px-5"
                        >
                            <AccordionTrigger className="py-4 text-left font-medium">
                                {faq.question}
                            </AccordionTrigger>

                            <AccordionContent className="pb-4 text-sm text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </>
    );
}