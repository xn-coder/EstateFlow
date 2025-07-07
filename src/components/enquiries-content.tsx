'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { SubmittedEnquiry, User } from '@/types';
import { getEnquiriesByPartner } from '@/app/manage-orders/actions';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Eye, Phone, Trash2 } from 'lucide-react';

const EnquiryCard = ({ enquiry }: { enquiry: SubmittedEnquiry }) => {
    const { toast } = useToast();

    const handleAction = (action: string) => {
        toast({ title: 'Info', description: `${action} action is not implemented yet.` });
    };
    
    return (
        <Card className="flex flex-col shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <p className="text-sm font-semibold">Enquiry ID: {enquiry.enquiryId}</p>
                <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Catalog Code</span><span className="font-medium">{enquiry.catalogCode}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Catalog Name</span><span className="font-medium">{enquiry.catalogTitle}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{enquiry.customerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{enquiry.customerEmail}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone No.</span><span className="font-medium">{enquiry.customerPhone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">City</span><span className="font-medium">{enquiry.customerPincode}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{format(parseISO(enquiry.createdAt), 'dd MMM yyyy')}</span></div>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAction('View')}><Eye className="h-4 w-4" /></Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('Call')}><Phone className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction('Delete')}><Trash2 className="h-4 w-4" /></Button>
            </CardFooter>
        </Card>
    );
};

export default function EnquiriesContent({ currentUser }: { currentUser: User }) {
    const [enquiries, setEnquiries] = React.useState<SubmittedEnquiry[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const fetchEnquiries = async () => {
            setLoading(true);
            const data = await getEnquiriesByPartner(currentUser.id);
            setEnquiries(data);
            setLoading(false);
        };
        fetchEnquiries();
    }, [currentUser.id]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Enquiry Details</CardTitle>
                </CardHeader>
            </Card>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
                </div>
            ) : enquiries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {enquiries.map((enquiry) => (
                        <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <h3 className="text-lg font-medium">No Enquiries Found</h3>
                        <p className="text-muted-foreground">You have not submitted any customer enquiries yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
