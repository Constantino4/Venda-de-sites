import React, { useState, useEffect } from 'react';
import { Website } from '../../types';
import { ThemeColors, TemplateDynamicPage, FloatingWhatsAppWidget } from './TemplateShared';

import {
  Template1Barbearia,
  Template2Restaurante,
  Template3Hotel,
  Template4Agencia,
  Template5Portfolio,
} from './TemplatesGroup1';

import {
  Template6Fotografo,
  Template7Escola,
  Template8Igreja,
  Template9LojaRoupas,
  Template10Imobiliaria,
} from './TemplatesGroup2';

import {
  Template11Clinica,
  Template12Ginasio,
  Template13SalaoBeleza,
  Template14Oficina,
  Template15Cafe,
} from './TemplatesGroup3';

import {
  Template16BlogRevista,
  Template17StartupTech,
  Template18Construcao,
  Template19EventosCasamentos,
  Template20Freelancer,
} from './TemplatesGroup4';

interface TemplateMasterRouterProps {
  website: Website;
  isDark: boolean;
  theme: ThemeColors;
  businessName: string;
  customPhone: string;
  customCta: string;
}

export const TemplateMasterRouter: React.FC<TemplateMasterRouterProps> = ({
  website,
  isDark,
  theme,
  businessName,
  customPhone,
  customCta,
}) => {
  // Active page state
  const defaultPage = (website.pages && website.pages.length > 0) ? website.pages[0] : 'Home';
  const [currentPage, setCurrentPage] = useState<string>(defaultPage);

  // Reset to default page when website changes
  useEffect(() => {
    if (website.pages && website.pages.length > 0) {
      setCurrentPage(website.pages[0]);
    } else {
      setCurrentPage('Home');
    }
  }, [website.id]);

  const buttonColor = website.customContent?.buttonColor;
  const buttonTextColor = website.customContent?.buttonTextColor || '#ffffff';
  const heroTitle = website.customContent?.heroTitle;
  const heroSubtitle = website.customContent?.heroSubtitle;
  const showWhatsApp = website.customContent?.showWhatsAppButton ?? false;
  const whatsappNumber = website.customContent?.whatsappNumber || '5511999999999';
  const visibleSections = website.customContent?.visibleSections;
  const rawPages = (website.pages && website.pages.length > 0)
    ? website.pages
    : ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'];
  const pages = Array.from(new Set(rawPages.filter((p): p is string => Boolean(p && typeof p === 'string'))));

  const sharedProps = {
    isDark,
    theme,
    businessName: businessName || website.customContent?.heroTitle || website.title.split('—')[0].trim(),
    businessTagline: heroSubtitle || website.shortDescription,
    customPhone: customPhone || website.customContent?.customPhone || '(11) 98765-4321',
    customCta: customCta || website.customContent?.customCta || 'Agendar Agora',
    currentPage,
    onNavigate: (p: string) => setCurrentPage(p),
    buttonColor,
    buttonTextColor,
    heroTitle,
    heroSubtitle,
    pages,
    showWhatsAppButton: showWhatsApp,
    whatsappNumber,
    visibleSections,
    testimonialsList: website.customContent?.testimonialsList,
    servicesList: website.customContent?.servicesList,
    faqList: website.customContent?.faqList,
    customPages: website.customContent?.customPages
  };

  // Match by id or category
  const id = website.id.toLowerCase();
  const category = website.category.toLowerCase();

  // Helper to render template with floating WhatsApp widget wrapper
  const renderWithWidgets = (templateNode: React.ReactNode) => (
    <div className="relative w-full h-full min-h-screen flex flex-col">
      {templateNode}
      <FloatingWhatsAppWidget
        enabled={showWhatsApp}
        phoneNumber={whatsappNumber}
        businessName={sharedProps.businessName}
      />
    </div>
  );

  // If user navigated to a dynamically added custom page that is not in the hardcoded sub-templates
  const hardcodedPagesLower = ['home', 'sobre', 'serviços', 'preços', 'equipa', 'galeria', 'agendamento', 'contactos', 'cardápio', 'quartos', 'comodidades', 'reservas', 'projetos', 'cases', 'artigos'];
  if (!hardcodedPagesLower.includes(currentPage.toLowerCase()) && currentPage !== 'Home') {
    return renderWithWidgets(<TemplateDynamicPage {...sharedProps} />);
  }

  // Template 1: Barbearia
  if (id.includes('barber') || category === 'barbearia') {
    return renderWithWidgets(<Template1Barbearia {...sharedProps} />);
  }

  // Template 2: Restaurante
  if (id.includes('bistro') || id.includes('restaurant') || category === 'restaurante') {
    return renderWithWidgets(<Template2Restaurante {...sharedProps} />);
  }

  // Template 3: Hotel
  if (id.includes('hotel') || id.includes('resort') || category === 'hotel') {
    return renderWithWidgets(<Template3Hotel {...sharedProps} />);
  }

  // Template 4: Agência Digital
  if (id.includes('agency') || id.includes('agencia') || category === 'agencia') {
    return renderWithWidgets(<Template4Agencia {...sharedProps} />);
  }

  // Template 5: Portfólio Profissional
  if (id.includes('portfolio') || category === 'portfolio') {
    return renderWithWidgets(<Template5Portfolio {...sharedProps} />);
  }

  // Template 6: Fotógrafo
  if (id.includes('photo') || id.includes('fotografia') || category === 'fotografia') {
    return renderWithWidgets(<Template6Fotografo {...sharedProps} />);
  }

  // Template 7: Escola
  if (id.includes('escola') || id.includes('school') || id.includes('edulearn') || category === 'escola') {
    return renderWithWidgets(<Template7Escola {...sharedProps} />);
  }

  // Template 8: Igreja
  if (id.includes('church') || id.includes('igreja') || id.includes('grace') || category === 'igreja') {
    return renderWithWidgets(<Template8Igreja {...sharedProps} />);
  }

  // Template 9: Loja de Roupas
  if (id.includes('roupas') || id.includes('moda') || id.includes('novastore') || category === 'ecommerce') {
    return renderWithWidgets(<Template9LojaRoupas {...sharedProps} />);
  }

  // Template 10: Imobiliária
  if (id.includes('imobiliaria') || id.includes('realestate') || category === 'imobiliaria' || category === 'realestate') {
    return renderWithWidgets(<Template10Imobiliaria {...sharedProps} />);
  }

  // Template 11: Clínica
  if (id.includes('clinica') || id.includes('medical') || category === 'clinica' || category === 'medical') {
    return renderWithWidgets(<Template11Clinica {...sharedProps} />);
  }

  // Template 12: Ginásio
  if (id.includes('ginasio') || id.includes('fitness') || id.includes('gym') || category === 'ginasio' || category === 'fitness') {
    return renderWithWidgets(<Template12Ginasio {...sharedProps} />);
  }

  // Template 13: Salão de Beleza
  if (id.includes('salao') || id.includes('beleza') || id.includes('beauty') || category === 'salao') {
    return renderWithWidgets(<Template13SalaoBeleza {...sharedProps} />);
  }

  // Template 14: Oficina Automóvel
  if (id.includes('oficina') || id.includes('auto') || id.includes('mecanica') || category === 'oficina') {
    return renderWithWidgets(<Template14Oficina {...sharedProps} />);
  }

  // Template 15: Café
  if (id.includes('cafe') || id.includes('coffee') || category === 'cafe') {
    return renderWithWidgets(<Template15Cafe {...sharedProps} />);
  }

  // Template 16: Blog / Revista
  if (id.includes('blog') || id.includes('revista') || id.includes('chronicle') || category === 'blog') {
    return renderWithWidgets(<Template16BlogRevista {...sharedProps} />);
  }

  // Template 17: Startup / Tecnologia
  if (id.includes('startup') || id.includes('tech') || id.includes('saas') || category === 'startup' || category === 'saas') {
    return renderWithWidgets(<Template17StartupTech {...sharedProps} />);
  }

  // Template 18: Empresa de Construção
  if (id.includes('construcao') || id.includes('obras') || id.includes('engenharia') || category === 'construcao') {
    return renderWithWidgets(<Template18Construcao {...sharedProps} />);
  }

  // Template 19: Eventos / Casamentos
  if (id.includes('eventos') || id.includes('casamento') || id.includes('wedding') || category === 'eventos') {
    return renderWithWidgets(<Template19EventosCasamentos {...sharedProps} />);
  }

  // Template 20: Freelancer
  if (id.includes('freelancer') || id.includes('copywriter') || id.includes('landing') || category === 'freelancer' || category === 'landing') {
    return renderWithWidgets(<Template20Freelancer {...sharedProps} />);
  }

  // Fallback to Template 4 (Agência) if no direct match
  return renderWithWidgets(<Template4Agencia {...sharedProps} />);
};
