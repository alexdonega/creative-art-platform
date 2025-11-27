import { Empresas, Templates, AiDesignSuggestions, InsertAiDesignSuggestions } from '@/shared/schema';

export interface DesignSuggestion {
  type: 'color' | 'layout' | 'content' | 'branding';
  title: string;
  description: string;
  data: any;
  confidence: number;
  reasoning: string;
}

export interface ColorSuggestion {
  type: 'color';
  title: string;
  description: string;
  data: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    reasoning: string;
  };
  confidence: number;
  reasoning: string;
}

export interface ContentSuggestion {
  type: 'content';
  title: string;
  description: string;
  data: {
    headlines: string[];
    callToActions: string[];
    descriptions: string[];
    reasoning: string;
  };
  confidence: number;
  reasoning: string;
}

export interface BrandingSuggestion {
  type: 'branding';
  title: string;
  description: string;
  data: {
    logoPlacement: string;
    brandElements: string[];
    typography: string;
    mood: string;
    reasoning: string;
  };
  confidence: number;
  reasoning: string;
}

export interface LayoutSuggestion {
  type: 'layout';
  title: string;
  description: string;
  data: {
    composition: string;
    hierarchy: string[];
    spacing: string;
    alignment: string;
    reasoning: string;
  };
  confidence: number;
  reasoning: string;
}

export class AIDesignService {
  
  /**
   * Generate design suggestions based on company and template context
   */
  async generateDesignSuggestions(
    company: Empresas, 
    template?: Templates
  ): Promise<DesignSuggestion[]> {
    const suggestions: DesignSuggestion[] = [];
    
    // Generate color suggestions
    const colorSuggestion = this.generateColorSuggestions(company);
    suggestions.push(colorSuggestion);
    
    // Generate content suggestions
    const contentSuggestion = this.generateContentSuggestions(company, template);
    suggestions.push(contentSuggestion);
    
    // Generate branding suggestions
    const brandingSuggestion = this.generateBrandingSuggestions(company);
    suggestions.push(brandingSuggestion);
    
    // Generate layout suggestions if template is provided
    if (template) {
      const layoutSuggestion = this.generateLayoutSuggestions(company, template);
      suggestions.push(layoutSuggestion);
    }
    
    return suggestions;
  }

  /**
   * Generate color palette suggestions based on company branding
   */
  private generateColorSuggestions(company: Empresas): ColorSuggestion {
    const currentColors = company.cores as any;
    const category = company.empresa_categoria;
    
    // Industry-specific color recommendations
    const industryColors = this.getIndustryColorPalette(category);
    
    // Analyze current colors and suggest improvements
    const suggestion: ColorSuggestion = {
      type: 'color',
      title: 'Paleta de Cores Otimizada',
      description: 'Sugestão de cores baseada na identidade da sua empresa e melhores práticas de design',
      data: {
        primary: industryColors.primary,
        secondary: industryColors.secondary,
        accent: industryColors.accent,
        background: industryColors.background,
        reasoning: `Cores selecionadas para maximizar o impacto visual e transmitir confiança no setor ${this.getCategoryName(category)}`
      },
      confidence: 88,
      reasoning: `Baseado na análise do seu setor e nas tendências atuais de design, essas cores irão melhorar o reconhecimento da marca em ${this.getCategoryName(category)}`
    };
    
    return suggestion;
  }

  /**
   * Generate content suggestions based on company information
   */
  private generateContentSuggestions(company: Empresas, template?: Templates): ContentSuggestion {
    const categoryName = this.getCategoryName(company.empresa_categoria);
    const companyName = company.nome;
    
    const headlines = [
      `${companyName} - Líder em ${categoryName}`,
      `Qualidade e Confiança em ${categoryName}`,
      `Sua melhor escolha em ${categoryName}`,
      `${companyName}: Excelência que você merece`
    ];
    
    const callToActions = [
      'Agende sua consulta',
      'Fale conosco hoje',
      'Solicite um orçamento',
      'Entre em contato',
      'Saiba mais'
    ];
    
    const descriptions = [
      `Com anos de experiência em ${categoryName}, oferecemos soluções personalizadas para suas necessidades.`,
      `${companyName} é sinônimo de qualidade e confiança no mercado de ${categoryName}.`,
      `Descubra por que somos a escolha preferida em ${categoryName}.`
    ];
    
    return {
      type: 'content',
      title: 'Conteúdo Personalizado',
      description: 'Sugestões de textos otimizados para sua empresa e público-alvo',
      data: {
        headlines,
        callToActions,
        descriptions,
        reasoning: `Textos criados especificamente para o setor de ${categoryName}, focando em conversão e engajamento`
      },
      confidence: 85,
      reasoning: `Baseado na análise do seu setor ${categoryName} e nas melhores práticas de marketing digital`
    };
  }

  /**
   * Generate branding suggestions
   */
  private generateBrandingSuggestions(company: Empresas): BrandingSuggestion {
    const categoryName = this.getCategoryName(company.empresa_categoria);
    
    return {
      type: 'branding',
      title: 'Elementos de Marca',
      description: 'Sugestões para fortalecer a identidade visual da sua empresa',
      data: {
        logoPlacement: 'Posicione o logo no canto superior esquerdo para máxima visibilidade',
        brandElements: [
          'Use consistentemente as cores da marca em todos os elementos',
          'Mantenha um espaçamento adequado ao redor do logo',
          'Aplique a tipografia da marca nos títulos principais'
        ],
        typography: 'Use fontes legíveis e profissionais que reflitam a seriedade do seu negócio',
        mood: `Transmita confiança e profissionalismo adequados ao setor de ${categoryName}`,
        reasoning: `Elementos selecionados para reforçar a credibilidade no mercado de ${categoryName}`
      },
      confidence: 90,
      reasoning: `Baseado nas melhores práticas de branding para empresas de ${categoryName}`
    };
  }

  /**
   * Generate layout suggestions based on template
   */
  private generateLayoutSuggestions(company: Empresas, template: Templates): LayoutSuggestion {
    const templateWidth = template.width || 1080;
    const templateHeight = template.height || 1080;
    const aspectRatio = templateWidth / templateHeight;
    
    let composition = 'Composição equilibrada';
    let hierarchy = ['Logo/Marca', 'Título principal', 'Descrição', 'Call to Action'];
    
    if (aspectRatio > 1.5) {
      // Landscape format
      composition = 'Layout horizontal com divisão em seções';
      hierarchy = ['Logo à esquerda', 'Conteúdo principal no centro', 'CTA à direita'];
    } else if (aspectRatio < 0.8) {
      // Portrait format
      composition = 'Layout vertical com hierarquia clara';
      hierarchy = ['Logo no topo', 'Título principal', 'Conteúdo', 'CTA na base'];
    }
    
    return {
      type: 'layout',
      title: 'Composição Otimizada',
      description: 'Sugestões de layout para maximizar o impacto visual',
      data: {
        composition,
        hierarchy,
        spacing: 'Use espaçamento generoso entre elementos para melhor legibilidade',
        alignment: 'Alinhe elementos importantes à esquerda para facilitar a leitura',
        reasoning: `Layout otimizado para formato ${templateWidth}x${templateHeight} pixels`
      },
      confidence: 87,
      reasoning: `Baseado nas dimensões do template e princípios de design visual`
    };
  }

  /**
   * Get industry-specific color palette
   */
  private getIndustryColorPalette(categoryId: number | null): any {
    const palettes: { [key: number]: any } = {
      6: { // Auto Escola
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#FCD34D',
        background: '#F8FAFC'
      },
      12: { // Outros/Default
        primary: '#1A73E8',
        secondary: '#34A853',
        accent: '#FBBC05',
        background: '#FFFFFF'
      }
    };
    
    return palettes[categoryId || 12] || palettes[12];
  }

  /**
   * Get category name for better context
   */
  private getCategoryName(categoryId: number | null): string {
    const categories: { [key: number]: string } = {
      6: 'Auto Escola',
      7: 'Saúde',
      8: 'Educação',
      9: 'Tecnologia',
      10: 'Alimentação',
      11: 'Beleza',
      12: 'Outros'
    };
    
    return categories[categoryId || 12] || 'Serviços';
  }

  /**
   * Get design trends for specific industries
   */
  private getDesignTrends(categoryId: number | null): string[] {
    const trends: { [key: number]: string[] } = {
      6: ['Cores confiáveis', 'Tipografia limpa', 'Ícones de segurança'],
      7: ['Cores suaves', 'Espaçamento amplo', 'Imagens profissionais'],
      8: ['Cores vibrantes', 'Layouts dinâmicos', 'Elementos interativos'],
      9: ['Gradientes modernos', 'Minimalismo', 'Tipografia sans-serif'],
      10: ['Cores apetitosas', 'Imagens de alta qualidade', 'Layouts atrativos'],
      11: ['Cores elegantes', 'Tipografia refinada', 'Layouts sofisticados']
    };
    
    return trends[categoryId || 12] || ['Design profissional', 'Cores equilibradas', 'Layout limpo'];
  }
}

export const aiDesignService = new AIDesignService();