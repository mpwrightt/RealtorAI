import { redirect } from 'next/navigation';

export const metadata = {
  title: 'SMS Campaigns - Agent Dashboard',
  description: 'Send bulk SMS messages to your clients',
};

export default function SMSCampaignsPage() {
  redirect('/dashboard/campaigns?tab=sms');
}
