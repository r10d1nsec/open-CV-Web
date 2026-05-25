-- Folio · Seed — Ángel Roldán (perfil real, reposicionado)
-- Refs: spec:002, spec:014. Date: 2026-05-25
--
-- Content-only e idempotente: actualiza el perfil `angel-roldan` (que ya existe)
-- y reemplaza sus tablas hijas. NO toca `user_id` (la propiedad se gestiona
-- aparte para que Ángel lo administre con su cuenta — ver start.md).
--
-- Reposicionamiento: desarrollo de soluciones, sistemas/redes, soporte HW/SW y
-- automatización con IA al frente; ciberseguridad como broche final.

begin;

update public.profiles set
  full_name = 'Ángel Roldán Ruiz',
  initials = 'AR',
  title = 'Desarrollo de soluciones · Sistemas, redes y automatización con IA',
  bio = 'Técnico polivalente que construye soluciones de principio a fin: webs de alto rendimiento, automatizaciones con IA y n8n, despliegue y mantenimiento de sistemas, redes y soporte (software y hardware). Fundador de ARCODE (Córdoba). +9 años de experiencia y 29 certificaciones. No espero instrucciones para mejorar: detecto lo que no funciona, propongo una solución y la llevo a cabo.',
  location = 'Córdoba, Andalucía, España',
  languages = array['Español','Inglés (técnico)'],
  available = true,
  available_line = 'Disponibilidad inmediata · Córdoba y remoto',
  hourly = null,
  email_public = 'angelroldanruiz@gmail.com',
  phone_public = '603 053 689',
  website = 'arcode.es',
  is_published = true,
  accent_color = '#00d4ff',
  font_family = 'inter',
  layout_variant = 'default',
  section_hidden = array['experience'],
  avatar_url = '/demo/angel.jpg',
  cv_url = null,
  company = 'ARCODE',
  whatsapp = '+34603053689',
  whatsapp_message = 'Hola Ángel, vi tu tarjeta y me gustaría hablar de…',
  card_style = 'aurora',
  onboarded_at = now()
where username = 'angel-roldan';

do $$
declare v_id uuid;
begin
  select id into v_id from public.profiles where username = 'angel-roldan';

  -- social
  delete from public.social_links where profile_id = v_id;
  insert into public.social_links (profile_id, kind, handle, url, position) values
    (v_id, 'linkedin', 'angel-roldan-cyber', 'https://linkedin.com/in/angel-roldan-cyber', 0),
    (v_id, 'github',   'r10d1nsec',          'https://github.com/r10d1nsec', 1),
    (v_id, 'website',  'arcode.es',          'https://arcode.es', 2);

  -- skills (orden = render; ciber como broche, certs al final)
  delete from public.skill_groups where profile_id = v_id;
  insert into public.skill_groups (profile_id, name, items, position) values
    (v_id, 'Desarrollo & Web', array['Next.js','Astro','React','TypeScript','HTML/CSS','APIs REST','Supabase'], 0),
    (v_id, 'Automatización & IA', array['n8n','Make','Zapier','Claude Code','MCP','AI Agents','RAG / Embeddings','Prompt engineering','Fine-tuning LLM','Amazon Bedrock','Python','Bash'], 1),
    (v_id, 'Sistemas & Redes', array['Windows Server','Active Directory','Redes LAN','Routers / Switches','Virtualización','Docker'], 2),
    (v_id, 'Hardware & Soporte', array['Reparación SW/HW','Instalación y mantenimiento','Electrónica','Diagnóstico','Soporte N1–N2'], 3),
    (v_id, 'Ciberseguridad', array['Pentesting Web','OWASP Top 10','Burp Suite','Kali Linux','Metasploit','TryHackMe Top 1%'], 4),
    (v_id, 'Certificaciones', array['TryHackMe ×10','Anthropic Academy ×12','Google AI ×6','CompTIA Pentest+','Cámara de Comercio'], 5);

  -- experiencia: eliminada del demo (sección oculta vía section_hidden)
  delete from public.experience_items where profile_id = v_id;

  -- proyectos (capturas reales; click → sitio real; ciber como broche)
  delete from public.projects where profile_id = v_id;
  insert into public.projects (profile_id, title, tag, blurb, stack, color, image_url, github_url, live_url, highlight, position) values
    (v_id, 'Ágora', 'Protocolo · 2026', 'Marketplace agent-native: agentes autónomos descubren, licencian y compran artefactos vía SIWE, REST, MCP y liquidación atómica en USDC (Base). Sin interfaz humana de por medio.',
     array['Next.js','FastAPI','MCP','A2A','Blockchain'], '#00d4ff', '/demo/agora.jpg', null, 'https://agora-forum.cfd', true, 0),
    (v_id, 'ARCODE', 'Agencia · 2026', 'Agencia de IA, automatización y ciberseguridad para PyMEs en Andalucía. Estrategia, web de alto rendimiento, agentes y pipeline de captación.',
     array['Next.js','n8n','IA'], '#6366f1', '/demo/arcode.jpg', null, 'https://arcode.es', true, 1),
    (v_id, 'VIGÍA', 'Producto · 2026', 'Plataforma de concienciación en ciberseguridad: simuladores de phishing, microformación por rol y guías alineadas con NIS2, RGPD y ENS.',
     array['Next.js','Seguridad','UX'], '#8b5cf6', '/demo/vigia.jpg', null, 'https://ciberseguridad.arcode.es', false, 2),
    (v_id, 'HANTARADAR', 'Producto · 2026', 'Seguimiento global y verificable de brotes de hantavirus, agregando datos de OMS, CDC, ECDC, ProMED y autoridades sanitarias en tiempo real.',
     array['Next.js','Datos','APIs'], '#f59e0b', '/demo/hantaradar.jpg', null, 'https://hantaradar.xyz', false, 3),
    (v_id, 'Folio', 'SaaS · 2026', 'Portfolio + tarjeta digital + QR + reservas para empleabilidad. La plataforma que estás viendo ahora.',
     array['Next.js','Supabase','Vercel'], '#22c55e', '/demo/folio.jpg', null, 'https://portfolio.arcode.es', false, 4),
    (v_id, 'Infraestructura y observabilidad', 'Sistemas · 2026', 'Despliegue y monitorización de sistemas en producción: Grafana + Prometheus, métricas, alertas y health checks. Reparación SW/HW, redes y soporte.',
     array['Grafana','Prometheus','Docker','Redes'], '#0ea5e9', '/demo/servidor.jpg', null, 'https://agora-forum.cfd', false, 5),
    (v_id, 'Security Lab', 'Red Team · 2026', 'Pentesting web y seguridad ofensiva: OWASP, Active Directory, adversary emulation. Jr Penetration Tester + 10 certs TryHackMe (Top 1%).',
     array['Kali','Burp Suite','Pentesting','OWASP'], '#f43f5e', '/demo/seclab.jpg', null, 'https://tryhackme.com/certificate/THM-VT2ER9DVPT', false, 6);

  -- servicios (auditoría de seguridad al final)
  delete from public.services where profile_id = v_id;
  insert into public.services (profile_id, external_id, name, duration_minutes, duration_text, price, blurb, popular, position) values
    (v_id, 's1', 'Llamada inicial', 30, null, 'Gratis', 'Entendemos tu necesidad y vemos encaje. Sin compromiso.', false, 0),
    (v_id, 's2', 'Desarrollo web', 60, null, 'Consultar', 'Webs rápidas (Next.js / Astro) optimizadas para Core Web Vitals.', true, 1),
    (v_id, 's3', 'Automatización con IA / n8n', 60, null, 'Consultar', 'Agentes y workflows que automatizan tareas y procesos de tu negocio.', false, 2),
    (v_id, 's4', 'Soporte y sistemas', 60, null, 'Consultar', 'Sistemas, redes, reparación SW/HW y puesta a punto de tu infraestructura.', false, 3),
    (v_id, 's5', 'Auditoría de seguridad', 60, null, 'Consultar', 'Pentesting web (OWASP) y recomendaciones priorizadas.', false, 4);

  delete from public.testimonials where profile_id = v_id;

  -- card_links (enlaces personalizados de la tarjeta)
  delete from public.card_links where profile_id = v_id;
  insert into public.card_links (profile_id, icon, label, url, position) values
    (v_id, 'web',      'arcode.es',              'https://arcode.es', 0),
    (v_id, 'calendar', 'Agenda una llamada',     'https://portfolio.arcode.es/angel-roldan/booking', 1),
    (v_id, 'link',     'Ágora · protocolo',      'https://agora-forum.cfd', 2),
    (v_id, 'shop',     'VIGÍA · ciberseguridad', 'https://ciberseguridad.arcode.es', 3);
end $$;

commit;
