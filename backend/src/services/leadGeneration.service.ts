import axios from 'axios';
import { GoogleServicesService } from './googleServices.service';

interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  contactEmail?: string | null;
  contactName?: string | null;
  estimatedSize: string;
  source: 'brave-search' | 'linkedin' | 'directory' | 'manual' | 'google-places';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  metadata: Record<string, any>;
  createdAt: Date;
}

export class LeadGenerationService {
  private braveApiKey: string;
  private googleServices: GoogleServicesService;

  constructor() {
    this.braveApiKey = process.env.BRAVE_API_KEY || '';
    this.googleServices = new GoogleServicesService();
  }

  /**
   * Generate leads based on target criteria
   * Uses Brave Search MCP + Web Scraping
   */
  async generateLeads(criteria: {
    industries: string[];
    companySize: string[];
    locations: string[];
    keywords: string[];
    limit: number;
  }): Promise<Lead[]> {
    const leads: Lead[] = [];

    for (const industry of criteria.industries) {
      // Search for companies in target industry
      const searchQuery = `${industry} companies ${criteria.keywords.join(' ')} contact`;
      
      try {
        const searchResults = await this.searchBrave(searchQuery, criteria.limit);

        for (const result of searchResults) {
          try {
            // Scrape company website for contact info
            const companyData = await this.extractCompanyInfo(result.url);
            
            const lead: Lead = {
              id: this.generateLeadId(),
              companyName: companyData.name || result.title,
              website: result.url,
              industry: industry,
              contactEmail: companyData.email,
              contactName: companyData.contactName,
              estimatedSize: this.estimateCompanySize(companyData),
              source: 'brave-search',
              status: 'new',
              metadata: {
                description: result.description,
                scrapedData: companyData,
                searchRank: result.rank
              },
              createdAt: new Date()
            };

            leads.push(lead);
          } catch (error) {
            console.error(`Failed to process lead: ${result.url}`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to search for industry: ${industry}`, error);
      }
    }

    // Save leads to database
    await this.saveLeads(leads);

    return leads;
  }

  /**
   * Generate leads using Google Places API (enhanced with location data)
   */
  async generateLeadsFromGoogle(criteria: {
    industries: string[];
    locations: string[];
    radius: number;
    limit: number;
  }): Promise<Lead[]> {
    const leads: Lead[] = [];

    for (const industry of criteria.industries) {
      for (const location of criteria.locations) {
        try {
          const googleLeads = await this.googleServices.generateLeadsFromGoogle(
            industry,
            location,
            criteria.radius
          );

          for (const googleLead of googleLeads.slice(0, criteria.limit)) {
            const lead: Lead = {
              id: googleLead.id,
              companyName: googleLead.companyName,
              website: googleLead.website || '',
              industry: industry,
              contactEmail: null, // Google Places doesn't provide email
              contactName: null,
              estimatedSize: this.estimateCompanySizeFromGoogle(googleLead),
              source: 'google-places',
              status: 'new',
              metadata: {
                address: googleLead.address,
                phone: googleLead.phone,
                rating: googleLead.rating,
                reviewCount: googleLead.reviewCount,
                location: googleLead.location,
                ...googleLead.metadata
              },
              createdAt: new Date()
            };

            leads.push(lead);
          }
        } catch (error) {
          console.error(`Failed to generate Google leads for ${industry} in ${location}:`, error);
        }
      }
    }

    // Save leads to database
    await this.saveLeads(leads);

    return leads;
  }

  /**
   * Qualify leads based on fit score
   */
  async qualifyLeads(leads: Lead[]): Promise<Lead[]> {
    const qualifiedLeads: Lead[] = [];

    for (const lead of leads) {
      const fitScore = await this.calculateFitScore(lead);
      
      if (fitScore >= 0.7) { // 70% fit threshold
        lead.status = 'qualified';
        lead.metadata.fitScore = fitScore;
        qualifiedLeads.push(lead);
      }
    }

    return qualifiedLeads;
  }

  private async searchBrave(query: string, limit: number): Promise<any[]> {
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        headers: {
          'X-Subscription-Token': this.braveApiKey,
          'Accept': 'application/json'
        },
        params: {
          q: query,
          count: limit,
          offset: 0,
          mkt: 'en-US',
          safesearch: 'moderate'
        }
      });

      return response.data.web?.results || [];
    } catch (error) {
      console.error('Brave search error:', error);
      return [];
    }
  }

  private async extractCompanyInfo(url: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AISimBot/1.0)'
        }
      });

      // Basic HTML parsing for contact info
      const html = response.data;
      const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
      const phoneMatch = html.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g);
      
      // Extract company name from title or h1
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      
      return {
        name: titleMatch?.[1] || h1Match?.[1] || 'Unknown Company',
        email: emailMatch?.[0] || null,
        phone: phoneMatch?.[0] || null,
        contactName: null
      };
    } catch (error) {
      console.error(`Failed to extract company info from ${url}:`, error);
      return {
        name: 'Unknown Company',
        email: null,
        phone: null,
        contactName: null
      };
    }
  }

  private async calculateFitScore(lead: Lead): Promise<number> {
    // AI-powered lead scoring using Claude
    const prompt = `
    Evaluate this lead for our AI automated ad company:
    
    Company: ${lead.companyName}
    Industry: ${lead.industry}
    Website: ${lead.website}
    Size: ${lead.estimatedSize}
    
    Score from 0-1 based on:
    1. Likelihood they need digital advertising
    2. Budget availability
    3. Technical sophistication
    4. Current digital presence
    
    Return only a number between 0 and 1.
    `;

    // Call Claude API for scoring
    const score = await this.callClaude(prompt);
    return parseFloat(score);
  }

  private async callClaude(prompt: string): Promise<string> {
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY
        }
      });

      return response.data.content[0].text || '0.5';
    } catch (error) {
      console.error('Claude API error:', error);
      return '0.5'; // Default score
    }
  }

  private generateLeadId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateCompanySize(companyData: any): string {
    // Simple heuristic based on website complexity
    if (companyData.email && companyData.phone) {
      return 'medium';
    } else if (companyData.email || companyData.phone) {
      return 'small';
    } else {
      return 'startup';
    }
  }

  private estimateCompanySizeFromGoogle(googleLead: any): string {
    // Estimate based on Google Places data
    const reviewCount = googleLead.reviewCount || 0;
    const rating = googleLead.rating || 0;
    const hasWebsite = !!googleLead.website;
    const hasPhone = !!googleLead.phone;

    if (reviewCount > 100 && rating > 4.0 && hasWebsite && hasPhone) {
      return 'large';
    } else if (reviewCount > 20 && rating > 3.5 && (hasWebsite || hasPhone)) {
      return 'medium';
    } else if (reviewCount > 0 || hasWebsite || hasPhone) {
      return 'small';
    } else {
      return 'startup';
    }
  }

  private async saveLeads(leads: Lead[]): Promise<void> {
    // Save to PostgreSQL database
    const { pool } = await import('../config/database.config');
    
    for (const lead of leads) {
      try {
        await pool.query(`
          INSERT INTO leads (id, company_name, website, industry, contact_email, contact_name, estimated_size, source, status, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            company_name = EXCLUDED.company_name,
            website = EXCLUDED.website,
            industry = EXCLUDED.industry,
            contact_email = EXCLUDED.contact_email,
            contact_name = EXCLUDED.contact_name,
            estimated_size = EXCLUDED.estimated_size,
            source = EXCLUDED.source,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        `, [
          lead.id,
          lead.companyName,
          lead.website,
          lead.industry,
          lead.contactEmail,
          lead.contactName,
          lead.estimatedSize,
          lead.source,
          lead.status,
          JSON.stringify(lead.metadata),
          lead.createdAt
        ]);
      } catch (error) {
        console.error(`Failed to save lead ${lead.id}:`, error);
      }
    }
  }
}
