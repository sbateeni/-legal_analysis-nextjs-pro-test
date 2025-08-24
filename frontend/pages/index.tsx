import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme } from '../contexts/ThemeContext'
import { isMobile } from '../utils/crypto'

export default function Home() {
  const router = useRouter()
  const { theme, darkMode } = useTheme()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // بيانات التسجيل
  const [officeData, setOfficeData] = useState({
    name: '',
    slug: '',
    description: '',
    email: '',
    subscription_plan: 'free',
    max_users: 5
  })
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [registerStep, setRegisterStep] = useState<'office' | 'admin'>('office')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // هنا سيتم إضافة منطق تسجيل الدخول
      setMessage('تم تسجيل الدخول بنجاح! جاري التوجيه...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleOfficeChange = (field: string, value: string | number) => {
    setOfficeData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'name') {
      const slug = generateSlug(value as string)
      setOfficeData(prev => ({ ...prev, slug }))
    }
  }

  const handleOfficeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!officeData.name || !officeData.slug || !officeData.email) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setRegisterStep('admin')
    setError('')
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adminData.password !== adminData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    if (adminData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    setError('')

    try {
      // هنا سيتم إضافة منطق إنشاء المكتب
      setMessage('تم إنشاء المكتب بنجاح! جاري التوجيه...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المكتب'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'خطة مجانية',
      price: 0,
      max_users: 5,
      features: ['5 مستخدمين', '100 قضية', 'قوالب أساسية', 'دعم أساسي']
    },
    {
      id: 'professional',
      name: 'خطة احترافية',
      price: 99,
      max_users: 20,
      features: ['20 مستخدم', 'قضايا غير محدودة', 'قوالب متقدمة', 'دعم فني', 'تقارير متقدمة']
    },
    {
      id: 'enterprise',
      name: 'خطة المؤسسات',
      price: 299,
      max_users: 100,
      features: ['100 مستخدم', 'ميزات متقدمة', 'دعم مخصص', 'API', 'تكامل مع أنظمة أخرى']
    }
  ]

  return (
    <>
      <Head>
        <title>التحليل القانوني الذكي - SaaS</title>
        <meta name="description" content="منصة SaaS متكاملة للمكاتب القانونية" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div style={{
        fontFamily: 'Tajawal, Arial, sans-serif',
        direction: 'rtl',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.card} 100%)`,
        color: theme.text,
        padding: 0,
        margin: 0,
        transition: 'background 0.4s',
      }}>
        {/* Header بسيط */}
        <div style={{
          background: `${theme.card}cc`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: `0 2px 20px ${theme.shadow}`,
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 1rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <div style={{fontSize: '2rem'}}>⚖️</div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: theme.text,
                }}>التحليل القانوني الذكي</h1>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
              }}>
                <button
                  onClick={() => setActiveTab('login')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    background: activeTab === 'login' ? theme.accent : 'transparent',
                    color: activeTab === 'login' ? '#fff' : theme.text,
                    border: `1px solid ${activeTab === 'login' ? theme.accent : theme.border}`,
                  }}
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    background: activeTab === 'register' ? theme.accent2 : 'transparent',
                    color: activeTab === 'register' ? '#fff' : theme.text,
                    border: `1px solid ${activeTab === 'register' ? theme.accent2 : theme.border}`,
                  }}
                >
                  إنشاء مكتب جديد
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '3rem 1rem',
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
          }}>
            <h2 style={{
              fontSize: isMobile() ? '2.5rem' : '3.5rem',
              fontWeight: 900,
              color: theme.accent,
              marginBottom: '1.5rem',
              textShadow: `0 2px 10px ${theme.shadow}`,
            }}>
              منصة SaaS للمكاتب القانونية
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: theme.text,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
              opacity: 0.9,
            }}>
              نظام متكامل لإدارة القضايا القانونية، المستخدمين، والقوالب مع حماية كاملة للخصوصية
            </p>
          </div>

          {/* علامات التبويب */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: theme.card,
              borderRadius: '0.75rem',
              boxShadow: `0 4px 20px ${theme.shadow}`,
              padding: '0.25rem',
              border: `1px solid ${theme.border}`,
            }}>
              <button
                onClick={() => setActiveTab('login')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  background: activeTab === 'login' ? theme.accent : 'transparent',
                  color: activeTab === 'login' ? '#fff' : theme.text,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🔐 تسجيل الدخول
              </button>
              <button
                onClick={() => setActiveTab('register')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  background: activeTab === 'register' ? theme.accent2 : 'transparent',
                  color: activeTab === 'register' ? '#fff' : theme.text,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🏢 إنشاء مكتب جديد
              </button>
            </div>
          </div>

          {/* نموذج تسجيل الدخول */}
          {activeTab === 'login' && (
            <div style={{
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              <div style={{
                background: theme.card,
                borderRadius: '1rem',
                boxShadow: `0 8px 32px ${theme.shadow}`,
                padding: '2rem',
                border: `1px solid ${theme.border}`,
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: theme.text,
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}>
                  تسجيل الدخول
                </h3>
                
                <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.text,
                      marginBottom: '0.5rem',
                    }}>
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: `2px solid ${theme.input}`,
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: darkMode ? '#1a1a2e' : '#fff',
                        color: theme.text,
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: `0 2px 8px ${theme.shadow}`,
                      }}
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.text,
                      marginBottom: '0.5rem',
                    }}>
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: `2px solid ${theme.input}`,
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: darkMode ? '#1a1a2e' : '#fff',
                        color: theme.text,
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: `0 2px 8px ${theme.shadow}`,
                      }}
                      placeholder="أدخل كلمة المرور"
                    />
                  </div>

                  {error && (
                    <div style={{
                      padding: '1rem',
                      background: theme.errorBg,
                      border: `1px solid ${theme.errorText}`,
                      borderRadius: '0.5rem',
                      color: theme.errorText,
                      fontSize: '0.875rem',
                      textAlign: 'center',
                    }}>
                      {error}
                    </div>
                  )}

                  {message && (
                    <div style={{
                      padding: '1rem',
                      background: '#dcfce7',
                      border: '1px solid #16a34a',
                      borderRadius: '0.5rem',
                      color: '#16a34a',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                    }}>
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: theme.accent,
                      color: '#fff',
                      fontWeight: 700,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: `0 4px 16px ${theme.accent}33`,
                    }}
                  >
                    {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                  </button>
                </form>

                <div style={{
                  marginTop: '1.5rem',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme.text,
                    opacity: 0.8,
                  }}>
                    ليس لديك حساب؟{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      style={{
                        color: theme.accent,
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      إنشاء مكتب جديد
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* نموذج إنشاء المكتب */}
          {activeTab === 'register' && (
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              <div style={{
                background: theme.card,
                borderRadius: '1rem',
                boxShadow: `0 8px 32px ${theme.shadow}`,
                padding: '2rem',
                border: `1px solid ${theme.border}`,
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: theme.text,
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}>
                  إنشاء مكتب قانوني جديد
                </h3>

                {/* خطوات التسجيل */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: registerStep === 'office' ? theme.accent2 : theme.border,
                      color: registerStep === 'office' ? '#fff' : theme.text,
                      fontWeight: 700,
                    }}>
                      1
                    </div>
                    <div style={{
                      width: '0.5rem',
                      height: '0.25rem',
                      background: registerStep === 'admin' ? theme.accent2 : theme.border,
                    }}></div>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: registerStep === 'admin' ? theme.accent2 : theme.border,
                      color: registerStep === 'admin' ? '#fff' : theme.text,
                      fontWeight: 700,
                    }}>
                      2
                    </div>
                  </div>
                </div>

                {registerStep === 'office' && (
                  <form onSubmit={handleOfficeSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
                      gap: '1.5rem',
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          اسم المكتب *
                        </label>
                        <input
                          type="text"
                          value={officeData.name}
                          onChange={(e) => handleOfficeChange('name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="مكتب المحاماة"
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          معرف المكتب *
                        </label>
                        <input
                          type="text"
                          value={officeData.slug}
                          onChange={(e) => handleOfficeChange('slug', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="office-name"
                        />
                        <p style={{
                          fontSize: '0.75rem',
                          color: theme.text,
                          opacity: 0.7,
                          marginTop: '0.25rem',
                        }}>
                          سيتم استخدامه في رابط المكتب
                        </p>
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.text,
                        marginBottom: '0.5rem',
                      }}>
                        وصف المكتب
                      </label>
                      <textarea
                        value={officeData.description}
                        onChange={(e) => handleOfficeChange('description', e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: `2px solid ${theme.input}`,
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          background: darkMode ? '#1a1a2e' : '#fff',
                          color: theme.text,
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxShadow: `0 2px 8px ${theme.shadow}`,
                          resize: 'vertical',
                        }}
                        placeholder="وصف مختصر عن المكتب..."
                      />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
                      gap: '1.5rem',
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          البريد الإلكتروني *
                        </label>
                        <input
                          type="email"
                          value={officeData.email}
                          onChange={(e) => handleOfficeChange('email', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="office@example.com"
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          خطة الاشتراك
                        </label>
                        <select
                          value={officeData.subscription_plan}
                          onChange={(e) => handleOfficeChange('subscription_plan', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                        >
                          {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} - {plan.price === 0 ? 'مجاناً' : `$${plan.price}/شهر`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {error && (
                      <div style={{
                        padding: '1rem',
                        background: theme.errorBg,
                        border: `1px solid ${theme.errorText}`,
                        borderRadius: '0.5rem',
                        color: theme.errorText,
                        textAlign: 'center',
                      }}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        background: theme.accent2,
                        color: '#fff',
                        fontWeight: 700,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: `0 4px 16px ${theme.accent2}33`,
                      }}
                    >
                      التالي: إنشاء حساب المدير
                    </button>
                  </form>
                )}

                {registerStep === 'admin' && (
                  <form onSubmit={handleAdminSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
                      gap: '1.5rem',
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          الاسم الكامل *
                        </label>
                        <input
                          type="text"
                          required
                          value={adminData.full_name}
                          onChange={(e) => setAdminData(prev => ({ ...prev, full_name: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="اسم المدير الكامل"
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          البريد الإلكتروني *
                        </label>
                        <input
                          type="email"
                          required
                          value={adminData.email}
                          onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="admin@office.com"
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
                      gap: '1.5rem',
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          كلمة المرور *
                        </label>
                        <input
                          type="password"
                          required
                          value={adminData.password}
                          onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="كلمة المرور"
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.text,
                          marginBottom: '0.5rem',
                        }}>
                          تأكيد كلمة المرور *
                        </label>
                        <input
                          type="password"
                          required
                          value={adminData.confirmPassword}
                          onChange={(e) => setAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `2px solid ${theme.input}`,
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: darkMode ? '#1a1a2e' : '#fff',
                            color: theme.text,
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 8px ${theme.shadow}`,
                          }}
                          placeholder="تأكيد كلمة المرور"
                        />
                      </div>
                    </div>

                    {error && (
                      <div style={{
                        padding: '1rem',
                        background: theme.errorBg,
                        border: `1px solid ${theme.errorText}`,
                        borderRadius: '0.5rem',
                        color: theme.errorText,
                        textAlign: 'center',
                      }}>
                        {error}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                    }}>
                      <button
                        type="button"
                        onClick={() => setRegisterStep('office')}
                        style={{
                          flex: 1,
                          background: theme.border,
                          color: theme.text,
                          fontWeight: 700,
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        رجوع
                      </button>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          flex: 1,
                          background: theme.accent2,
                          color: '#fff',
                          fontWeight: 700,
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '1rem',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: loading ? 0.7 : 1,
                          boxShadow: `0 4px 16px ${theme.accent2}33`,
                        }}
                      >
                        {loading ? 'جاري الإنشاء...' : 'إنشاء المكتب'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          background: `${theme.card}cc`,
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${theme.border}`,
          marginTop: '5rem',
          boxShadow: `0 -2px 20px ${theme.shadow}`,
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '2rem 1rem',
            textAlign: 'center',
          }}>
            <div style={{
              color: theme.text,
              opacity: 0.8,
            }}>
              <p>&copy; 2024 التحليل القانوني الذكي. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 