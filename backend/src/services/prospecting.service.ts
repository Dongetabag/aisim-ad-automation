import { GoogleGenerativeAI } from '@google/generative-ai';

interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  contactEmail?: string;
  contactName?: string;
  estimatedSize: string;
  source: 'brave-search' | 'linkedin' | 'directory' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  metadata: Record<string, any>;
  createdAt: Date;
}

interface ProspectingCampaign {
  id: string;
  name: string;
  leadIds: string[];
  emailTemplate: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
  };
}

export class ProspectingService {
  private emailService: any;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    this.emailService = {
      send: async (emailData: any) => {
        // Mock email service - replace with actual email provider
        console.log('Sending email:', emailData);
        return { success: true, messageId: `msg_${Date.now()}` };
      }
    };
  }

  /**
   * Create and execute automated prospecting campaign
   */
  async createCampaign(leads: Lead[], template: string): Promise<ProspectingCampaign> {
    const campaign: ProspectingCampaign = {
      id: this.generateCampaignId(),
      name: `Campaign_${new Date().toISOString().split('T')[0]}`,
      leadIds: leads.map(l => l.id),
      emailTemplate: template,
      status: 'active',
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0
      }
    };

    // Execute campaign
    await this.executeCampaign(campaign, leads);

    return campaign;
  }

  private async executeCampaign(campaign: ProspectingCampaign, leads: Lead[]): Promise<void> {
    for (const lead of leads) {
      try {
        // Personalize email using AI
        const personalizedEmail = await this.personalizeEmail(campaign.emailTemplate, lead);
        
        // Send email
        await this.emailService.send({
          to: lead.contactEmail!,
          subject: this.extractSubject(personalizedEmail),
          body: personalizedEmail,
          trackOpens: true,
          trackClicks: true
        });

        campaign.metrics.sent++;
        
        // Update lead status
        await this.updateLeadStatus(lead.id, 'contacted');
        
        // Add delay to avoid spam flags
        await this.delay(Math.random() * 5000 + 2000); // 2-7 seconds
      } catch (error) {
        console.error(`Failed to contact lead ${lead.id}:`, error);
      }
    }
  }

  private async personalizeEmail(template: string, lead: Lead): Promise<string> {
    const prompt = `
    Personalize this email template for this prospect:
    
    Template:
    ${template}
    
    Prospect Info:
    - Company: ${lead.companyName}
    - Industry: ${lead.industry}
    - Contact: ${lead.contactName || 'Marketing Team'}
    
    Make it compelling, professional, and specific to their industry.
    Include a clear call-to-action to book a demo.
    Keep the AISim brand tone: confident, results-oriented.
    `;

    // Call Google AI API
    return await this.callGoogleAI(prompt, template);
  }

  private async callGoogleAI(prompt: string, fallbackTemplate?: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text || fallbackTemplate || 'Default email template';
    } catch (error) {
      console.error('Google AI API error:', error);
      return fallbackTemplate || 'Default email template'; // Fallback to original template
    }
  }

  private generateCampaignId(): string {
    return `campaign_${Date.now()}`;
  }

  private extractSubject(email: string): string {
    // Extract subject line from email
    const lines = email.split('\n');
    const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject:'));
    return subjectLine ? subjectLine.replace(/^subject:\s*/i, '') : 'AISim - AI-Powered Ad Solutions';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async updateLeadStatus(leadId: string, status: string): Promise<void> {
    const { pool } = await import('../config/database.config');
    
    try {
      await pool.query(
        'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, leadId]
      );
    } catch (error) {
      console.error(`Failed to update lead status for ${leadId}:`, error);
    }
  }
}
