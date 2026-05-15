import { useEffect, useState } from 'react'
import { Bath, BedDouble, Car, Check, CirclePlay, Mail, MapPin, Menu, Phone, Send, X } from 'lucide-react'

import heroImage from './assets/hero.png'
import towerImage from './assets/tower.jpg'
import entranceImage from './assets/entrance.jpg'
import videoBg from './assets/video-bg.jpg'
import locationImage from './assets/location.jpg'
import apartmentImage from './assets/apartment.jpg'
import floorplanImage from './assets/floorplan.jpg'
import leisureBg from './assets/leisure-bg.png'
import poolImage from './assets/pool.jpg'
import gymImage from './assets/gym.jpg'
import contactFace from './assets/contact-face.png'
import logoGr from "./assets/logogr.png"
import logoGr2 from "./assets/logogr2.png"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5515999999999'

const menuItems = [
  ['O empreendimento', '#empreendimento'],
  ['Localização', '#localizacao'],
  ['Diferenciais', '#diferenciais'],
  ['Apartamentos', '#apartamentos'],
  ['Planta', '#planta'],
  ['Lazer', '#lazer'],
  ['Contato', '#contato'],
]

const features = [
  'Torre única de 19 pavimentos',
  'Fachada contemporânea',
  'Apenas 60 unidades',
  '4 apartamentos por andar',
  'Pavimento de lazer completo',
  '120 vagas',
  'Ambientes técnicos pensados para desempenho acústico, hidráulico e manutenção adequada',
]

const planItems = [
  'Sala de estar e jantar integradas',
  'Lavabo',
  'Integração total entre ambientes',
  'Cozinha e lavanderia conectadas',
  'Varanda com vista privilegiada',
  'Circulação inteligente',
  'Despensa',
  'Suíte master com closet',
  'Excelente iluminação natural',
]

const leisureInternal = ['Academia', 'Pilates', 'Massagem', 'Sauna seca e úmida', 'Coworking', 'Sala de reunião', 'Brinquedoteca', 'Espaço gourmet', 'Salão de festas', 'Salão de jogos', 'Espaço beleza']
const leisureExternal = ['Piscina', 'Spa', 'Quadra de beach tennis', 'Quadra poliesportiva', 'Playground', 'Pet place', 'Casa de campo', 'Pergolados e áreas de descanso']
const clubSlides = [
  {
    title: 'Piscina',
    image: poolImage,
  },
  {
    title: 'Academia',
    image: gymImage,
  },
]

function onlyNumbers(value) {
  return String(value || '').replace(/\D/g, '')
}

function buildLeadWhatsAppUrl(contact) {
  const message = [
    "Olá! Novo contato pelo site Grand'Oro Vila Barth:",
    '',
    `Nome: ${contact.name}`,
    `E-mail: ${contact.email}`,
    `Telefone: ${contact.phone}`,
  ].join('\n')

  return `https://wa.me/${onlyNumbers(WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`
}

function buildClientWhatsAppUrl(phone) {
  const digits = onlyNumbers(phone)
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}`
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

function Logo({ small = false }) {
  return (
    <a className={`logo ${small ? 'logo--small' : ''}`} href="#top" aria-label="Grand Oro">
      <span className="logo__mark">GO</span>
      <span className="logo__text">
        GRAND'ORO
        <small>VILA BARTH</small>
      </span>
    </a>
  )
}

function SectionTitle({ eyebrow, title, align = 'center' }) {
  return (
    <div className={`section-title section-title--${align}`}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
    </div>
  )
}

function ContactForm({ compact = false }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível enviar seu contato.')
      }

      const whatsappUrl = buildLeadWhatsAppUrl(form)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

      setForm({ name: '', email: '', phone: '' })
      setStatus({
        type: 'success',
        message: 'Contato salvo. O WhatsApp será aberto com a mensagem pronta.',
        whatsappUrl,
      })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={`contact-form ${compact ? 'contact-form--compact' : ''}`} onSubmit={submit}>
      <label>
        <span>Nome</span>
        <input name="name" value={form.name} onChange={updateField} autoComplete="name" required />
      </label>

      <label>
        <span>E-mail</span>
        <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
      </label>

      <label>
        <span>Telefone com DDD</span>
        <input name="phone" value={form.phone} onChange={updateField} autoComplete="tel" required />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Falar com um especialista'}
        {!loading && <Send size={14} />}
      </button>

      {status.message && (
        <p className={`form-status form-status--${status.type}`}>
          {status.message}
          {status.whatsappUrl && (
            <a href={status.whatsappUrl} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
          )}
        </p>
      )}
    </form>
  )
}


function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('grandOroAdminToken') || '')
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadContacts(event) {
    event?.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        headers: { 'x-admin-token': token },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível carregar os contatos.')
      }

      localStorage.setItem('grandOroAdminToken', token)
      setContacts(data.contacts || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="admin-page">
      <section className="admin-card">
        <div className="admin-header">
          <div>
            <span>Grand'Oro</span>
            <h1>Contatos recebidos</h1>
          </div>
          <a href="/">Voltar para o site</a>
        </div>

        <form className="admin-token" onSubmit={loadContacts}>
          <label>
            Token administrativo
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Digite o ADMIN_TOKEN do .env"
              required
            />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Carregando...' : 'Carregar contatos'}</button>
        </form>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                  <td>{contact.phone}</td>
                  <td>{formatDate(contact.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <a href={buildClientWhatsAppUrl(contact.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
                      <a href={`mailto:${contact.email}`}>E-mail</a>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && contacts.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty">Nenhum contato encontrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

                export default function App() {
            const [menuOpen, setMenuOpen] = useState(false)
            const [clubIndex, setClubIndex] = useState(0)

            const visibleClubSlides = [
              clubSlides[clubIndex],
              clubSlides[(clubIndex + 1) % clubSlides.length],
            ]

            function nextClubSlide() {
              setClubIndex((current) => (current + 1) % clubSlides.length)
            }

            function previousClubSlide() {
              setClubIndex((current) =>
                current === 0 ? clubSlides.length - 1 : current - 1
              )
            }

          if (window.location.pathname === '/admin') {
            return <AdminPage />
          }

          return (
            <main id="top">
              <header
          className="hero hero--figma"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <a
            className="whatsapp whatsapp--hero"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Tenho interesse no Grand'Oro Vila Barth.`}
            aria-label="Falar pelo WhatsApp"
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={22} />
          </a>
        </header>

        <section className="launch-strip">
          Lançamento
        </section>

        <section className="stats-strip" aria-label="Características do apartamento">
          <div className="stats-line"></div>

          <div className="stats-main">
            <strong>127</strong>
            <span>M²</span>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-item">
            <strong>3</strong>
            <span>Suítes</span>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-item">
            <strong>2</strong>
            <span>Vagas</span>
          </div>

          <div className="stats-line"></div>
        </section>

        <nav className="figma-nav">
          <Logo small />

          <button
            className="nav__toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <div className={`figma-nav__links ${menuOpen ? 'figma-nav__links--open' : ''}`}>
            {menuItems.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </div>
        </nav>
    <section className="intro intro-figma" id="empreendimento">
  <div className="intro-title-figma">
    <p>Do ponto mais alto da Vila Barth,</p>
    <h1>
      Um novo ícone começa
      <br />
      <strong>nascer</strong>
    </h1>
  </div>

  <div className="intro-grid-figma">
    <img
      className="intro-tower-figma"
      src={towerImage}
      alt="Perspectiva da torre Grand'Oro"
    />

    <div className="intro-middle-figma">
      <img src={entranceImage} alt="Entrada do empreendimento" />

      <h3>
        O valor
        <br />
        de viver
        <br />
        o que é raro
      </h3>
    </div>

    <div className="intro-copy-figma">
      <p>
        Grand’Oro é mais do que um breve lançamento.
      </p>

      <p>
        É um gesto.
        <br />
        Um marco.
        <br />
        Um símbolo de como a arquitetura pode elevar
        <br />
        a vida das pessoas quando nasce de propósito e
        <br />
        precisão.
      </p>

      <p>
        Em um dos endereços mais tradicionais da
        <br />
        cidade, Grand’Oro surge como um farol:
      </p>

      <h4>
        Elegante, imponente
        <br />
        & atemporal.
      </h4>

      <a className="outline-button intro-button-figma" href="#contato">
        Falar com especialista
      </a>
    </div>
  </div>
</section>

      <section className="video-band" style={{ backgroundImage: `linear-gradient(rgba(3, 18, 32, .78), rgba(3, 18, 32, .78)), url(${videoBg})` }}>
        <h2>Conheça o Grand'Oro<br />mais de perto</h2>
        <button className="play-button" type="button" aria-label="Assistir ao vídeo">
          <CirclePlay />
          <span>Assista o vídeo</span>
        </button>
      </section>

      <section className="location" id="localizacao">
        <div className="location__image">
          <img src={locationImage} alt="Vista aérea da localização do empreendimento" />
        </div>

        <div className="location__copy">
          <img className="monogram-img" src={logoGr} alt="Grand'Oro" />
          <h2>Vila Barth:</h2>
          <h3>tradição, tranquilidade e prestígio</h3>
          <p>Grand'Oro está estrategicamente posicionado em uma das regiões mais desejadas da cidade, cercado por conveniência, mobilidade e serviços de alto padrão.</p>
          <p>Próximo às principais vias, aos polos gastronômicos, escolas, comércio e serviços essenciais, o empreendimento oferece a praticidade do cotidiano sem abrir mão da tranquilidade de um bairro tradicional e valorizado.</p>
        </div>
      </section>

      <section className="differentials section" id="diferenciais">
        <div>
          <SectionTitle title="diferenciais exclusivos" />
          <a className="outline-button" href="#contato">Falar com especialista</a>
        </div>

        <ul>
          {features.map((item) => (
            <li key={item}><Check size={16} />{item}</li>
          ))}
        </ul>
      </section>

      <section className="apartments" id="apartamentos">
        <div className="apartments__copy">
          <img className="monogram-img" src={logoGr} alt="Grand'Oro" />
          <h2>Os apartamentos</h2>
          <p>O Grand'Oro apresenta uma tipologia única de 127 m², cuidadosamente planejada para oferecer amplitude e integração.</p>
          <p>A fusão entre funcionalidade e acabamento sofisticado cria um ambiente que acolhe, impressiona e inspira.</p>
        </div>
        <img src={apartmentImage} alt="Apartamento decorado com sala integrada" />
      </section>

      <section className="plan section" id="planta">
        <div className="plan__header">
          <div>
            <span>Planta</span>
            <h2>127 <small>m²</small></h2>
          </div>
          <img src={floorplanImage} alt="Planta de apartamento de 127 metros quadrados" />
        </div>

            <div className="plan__items">
              {planItems.map((item) => (
                <article key={item}>
                  <img className="plan-icon" src={logoGr2} alt="" />
                  <p className="plan-text">{item}</p>
                </article>
              ))}
            </div>
      </section>

      <section className="leisure" id="lazer" style={{ backgroundImage: `linear-gradient(90deg, rgba(2, 14, 26, .06), rgba(2, 14, 26, .25)), url(${leisureBg})` }}>
        <div className="leisure__card">
          <h2>O lazer</h2>
          <h3>um clube elevado</h3>
          <p>O Grand’Oro conta com 2.000m² dedicado ao lazer e ao bem-estar.

          Um espaço criado para proporcionar experiências
          únicas, com ambientes sofisticados que
          equilibram convivência, tranquilidade e saúde.</p>

          <div className="leisure__lists">
            <div>
              <strong>Áreas internas</strong>
              <ul>{leisureInternal.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <strong>Áreas externas</strong>
              <ul>{leisureExternal.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

     <section className="club" id="club">
  <div className="club__title">
    <h2>Lazer de clube</h2>
    <p>Com cara de condomínio premium</p>
  </div>

  <div className="club__carousel">
    <button
      className="club__arrow club__arrow--left"
      type="button"
      onClick={previousClubSlide}
      aria-label="Imagem anterior"
    >
      ‹
    </button>

    <div className="club__grid">
      {visibleClubSlides.map((slide, index) => (
        <figure
          className={index === 0 ? 'club__item club__item--large' : 'club__item'}
          key={`${slide.title}-${index}`}
        >
          <img src={slide.image} alt={slide.title} />
          <figcaption>{slide.title}</figcaption>
        </figure>
      ))}
    </div>

    <button
      className="club__arrow club__arrow--right"
      type="button"
      onClick={nextClubSlide}
      aria-label="Próxima imagem"
    >
      ›
    </button>
  </div>

  <div className="club__dots">
    {clubSlides.map((slide, index) => (
      <button
        key={slide.title}
        type="button"
        className={index === clubIndex ? 'club__dot club__dot--active' : 'club__dot'}
        onClick={() => setClubIndex(index)}
        aria-label={`Ver ${slide.title}`}
      />
    ))}
  </div>
</section>

      <section className="contact" id="contato">
        <div className="contact__content">
          <h2>Entre em contato para mais informações</h2>
          <ContactForm />
        </div>
        <img src={contactFace} alt="Mulher em imagem conceitual do empreendimento" />
      </section>

    </main>
  )
}
