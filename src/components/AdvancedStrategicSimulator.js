import React, { useState, useEffect } from 'react';
import { ChevronRight, Users, Brain, BookOpen, BarChart3, Settings, Play, Save, Upload, MessageCircle, Target, TrendingUp, Award, Clock, Globe, Shield, Zap } from 'lucide-react';

const AdvancedStrategicSimulator = () => {
  const [activeTab, setActiveTab] = useState('simulator');
  const [gameMode, setGameMode] = useState('single');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [campaignProgress, setCampaignProgress] = useState({ round: 1, totalScore: 0, decisions: [] });
  const [userProfile, setUserProfile] = useState({ 
    name: '', 
    experience: 'beginner',
    specialization: 'general',
    preferences: {},
    statistics: { totalDecisions: 0, avgScore: 0, strongestArea: '', weakestArea: '' }
  });
  const [collaborativeSession, setCollaborativeSession] = useState({
    isActive: false,
    sessionId: '',
    participants: [],
    messages: [],
    currentVoter: null
  });
  const [customScenarios, setCustomScenarios] = useState([]);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');

  const simulationTypes = [
    { id: 'crisis', name: 'Gestão de Crise', emoji: '🚨', description: 'Situações de emergência que requerem resposta imediata', difficulty: 'high' },
    { id: 'diplomacy', name: 'Negociação Diplomática', emoji: '🤝', description: 'Resolução de conflitos através do diálogo', difficulty: 'medium' },
    { id: 'resource', name: 'Alocação de Recursos', emoji: '📊', description: 'Distribuição estratégica de recursos limitados', difficulty: 'medium' },
    { id: 'intelligence', name: 'Operações de Inteligência', emoji: '🕵️', description: 'Coleta e análise de informações estratégicas', difficulty: 'high' },
    { id: 'cyber', name: 'Segurança Cibernética', emoji: '💻', description: 'Proteção contra ameaças digitais', difficulty: 'high' },
    { id: 'humanitarian', name: 'Ajuda Humanitária', emoji: '❤️', description: 'Coordenação de operações de socorro', difficulty: 'low' },
    { id: 'continuity', name: 'Continuidade de Apoio', emoji: '📋', description: 'Decisões sobre manutenção de operações', difficulty: 'medium' },
    { id: 'coordination', name: 'Coordenação de Células', emoji: '🔗', description: 'Integração entre diferentes unidades operacionais', difficulty: 'high' },
    { id: 'disinformation', name: 'Desinformação', emoji: '🛡️', description: 'Gestão de campanhas de informação falsa', difficulty: 'high' },
    { id: 'deepfake', name: 'Detecção de Deepfake', emoji: '🔍', description: 'Identificação de conteúdo manipulado', difficulty: 'high' },
    { id: 'civil', name: 'Engajamento Civil', emoji: '🤝', description: 'Interação com populações pós-conflito', difficulty: 'medium' },
    { id: 'coastal', name: 'Engajamento Costeiro', emoji: '🏖️', description: 'Trabalho com comunidades marítimas', difficulty: 'medium' },
    { id: 'deterrence', name: 'Mensagens de Dissuasão', emoji: '📢', description: 'Desenvolvimento de comunicação estratégica', difficulty: 'medium' },
    { id: 'infrastructure', name: 'Priorização de Infraestrutura', emoji: '🏗️', description: 'Gestão de recursos críticos', difficulty: 'medium' },
    { id: 'transition', name: 'Transição de Autoridades', emoji: '🔄', description: 'Transferência para governo civil', difficulty: 'low' }
  ];

  const baseScenarios = {
    crisis: [
      {
        id: 'cyber_attack',
        title: 'Ataque Cibernético Massivo',
        description: 'Infraestrutura crítica nacional sob ataque coordenado. Sistemas bancários, energia e comunicações comprometidos.',
        context: 'Às 03:00, múltiplos sistemas críticos começaram a falhar simultaneamente. Evidências apontam para um ataque coordenado por atores estatais.',
        timeLimit: 180,
        stakeholders: ['Governo', 'Setor Privado', 'População Civil', 'Militares', 'Agências de Inteligência'],
        options: [
          {
            id: 'immediate_response',
            text: 'Ativação imediata do protocolo de emergência nacional',
            consequences: {
              short: 'Resposta rápida, mas possível pânico público',
              medium: 'Sistemas parcialmente restaurados, economia impactada',
              long: 'Fortalecimento da cibersegurança nacional'
            },
            scores: { political: 70, economic: 40, social: 50, military: 90, international: 60 }
          },
          {
            id: 'covert_response',
            text: 'Resposta silenciosa com contra-ataque cibernético',
            consequences: {
              short: 'Ataques continuam, mas preparação de resposta',
              medium: 'Contra-ataque efetivo, escalada internacional possível',
              long: 'Estabelecimento de nova doutrina cibernética'
            },
            scores: { political: 60, economic: 60, social: 40, military: 80, international: 30 }
          },
          {
            id: 'diplomatic_approach',
            text: 'Canais diplomáticos para cessar-fogo cibernético',
            consequences: {
              short: 'Ataques podem continuar durante negociações',
              medium: 'Possível acordo, mas vulnerabilidade demonstrada',
              long: 'Precedente para resolução pacífica de conflitos cibernéticos'
            },
            scores: { political: 50, economic: 70, social: 60, military: 30, international: 90 }
          }
        ]
      }
    ],
    diplomacy: [
      {
        id: 'border_dispute',
        title: 'Disputa Territorial Complexa',
        description: 'Tensão crescente em fronteira disputada com mobilização militar de ambos os lados.',
        context: 'Incidente fronteiriço escalou para confronto com baixas de ambos os lados. Comunidade internacional pressiona por solução.',
        timeLimit: 300,
        stakeholders: ['País Vizinho', 'ONU', 'População Local', 'Militares', 'Mídia Internacional'],
        options: [
          {
            id: 'mediation_request',
            text: 'Solicitar mediação internacional imediata',
            consequences: {
              short: 'Pausa nas hostilidades, perda de controle sobre processo',
              medium: 'Negociações longas, pressão internacional',
              long: 'Solução duradoura, mas possíveis concessões territoriais'
            },
            scores: { political: 60, economic: 50, social: 70, military: 40, international: 90 }
          },
          {
            id: 'bilateral_talks',
            text: 'Negociações bilaterais diretas',
            consequences: {
              short: 'Controle do processo, mas hostilidades podem continuar',
              medium: 'Progresso lento, flexibilidade nas soluções',
              long: 'Acordo bilateral forte ou escalada do conflito'
            },
            scores: { political: 80, economic: 60, social: 50, military: 60, international: 60 }
          },
          {
            id: 'show_of_force',
            text: 'Demonstração de força com reforços militares',
            consequences: {
              short: 'Escalada imediata, mas posição de força',
              medium: 'Possível recuo do adversário ou conflito maior',
              long: 'Vitória militar ou guerra prolongada'
            },
            scores: { political: 40, economic: 30, social: 40, military: 90, international: 20 }
          }
        ]
      }
    ],
    humanitarian: [
      {
        id: 'disaster_response',
        title: 'Resposta a Desastre Natural',
        description: 'Terremoto de magnitude 7.2 atingiu região densamente povoada. Milhares de desabrigados e infraestrutura destruída.',
        context: 'Primeiras 72 horas são críticas. Recursos limitados e múltiplas necessidades urgentes competindo por atenção.',
        timeLimit: 240,
        stakeholders: ['População Afetada', 'ONG Internacionais', 'Governo Local', 'Forças Armadas', 'Mídia'],
        options: [
          {
            id: 'search_rescue_priority',
            text: 'Priorizar operações de busca e salvamento',
            consequences: {
              short: 'Vidas salvas imediatamente, outras necessidades postergadas',
              medium: 'Moral elevado, mas problemas logísticos crescem',
              long: 'Redução da mortalidade, base sólida para reconstrução'
            },
            scores: { political: 80, economic: 50, social: 90, military: 70, international: 85 }
          },
          {
            id: 'logistics_infrastructure',
            text: 'Foco em restaurar infraestrutura e logística',
            consequences: {
              short: 'Progresso mais lento no salvamento, bases sólidas',
              medium: 'Operações mais eficientes, capacidade aumentada',
              long: 'Recuperação mais rápida e sustentável'
            },
            scores: { political: 60, economic: 85, social: 70, military: 80, international: 75 }
          },
          {
            id: 'medical_humanitarian',
            text: 'Priorizar assistência médica e humanitária',
            consequences: {
              short: 'Sofrimento reduzido, necessidades básicas atendidas',
              medium: 'Epidemias prevenidas, confiança da população',
              long: 'Comunidade mais resiliente e preparada'
            },
            scores: { political: 75, economic: 60, social: 95, military: 60, international: 90 }
          }
        ]
      }
    ]
  };

  const aiAnalyzer = {
    analyzeDecision: (decision, userHistory) => {
      const patterns = aiAnalyzer.identifyPatterns(userHistory);
      const insights = {
        decisionStyle: patterns.style,
        strengthAreas: patterns.strengths,
        improvementAreas: patterns.weaknesses,
        recommendation: aiAnalyzer.generateRecommendation(decision, patterns),
        riskAssessment: aiAnalyzer.assessRisk(decision),
        alternativeSuggestions: aiAnalyzer.suggestAlternatives(decision)
      };
      return insights;
    },

    identifyPatterns: (history) => {
      if (!history || history.length === 0) return { style: 'Novo Usuário', strengths: [], weaknesses: [] };
      
      const scores = history.map(d => d.scores);
      const avgScores = {
        political: scores.reduce((sum, s) => sum + s.political, 0) / scores.length,
        economic: scores.reduce((sum, s) => sum + s.economic, 0) / scores.length,
        social: scores.reduce((sum, s) => sum + s.social, 0) / scores.length,
        military: scores.reduce((sum, s) => sum + s.military, 0) / scores.length,
        international: scores.reduce((sum, s) => sum + s.international, 0) / scores.length
      };

      const style = avgScores.military > 70 ? 'Agressivo' : 
                   avgScores.international > 70 ? 'Diplomático' :
                   avgScores.economic > 70 ? 'Pragmático' : 'Equilibrado';

      return {
        style,
        strengths: Object.entries(avgScores).filter(([_, score]) => score > 70).map(([area, _]) => area),
        weaknesses: Object.entries(avgScores).filter(([_, score]) => score < 50).map(([area, _]) => area)
      };
    },

    generateRecommendation: (decision, patterns) => {
      const recommendations = {
        'Agressivo': "Considere abordagens mais diplomáticas para equilibrar suas decisões",
        'Diplomático': "Sua abordagem diplomática é forte, mas considere também aspectos militares",
        'Pragmático': "Excelente foco econômico, mas atenção aos impactos sociais",
        'Equilibrado': "Perfil equilibrado, continue desenvolvendo todas as áreas"
      };
      return recommendations[patterns.style] || "Continue desenvolvendo seu estilo de liderança";
    },

    assessRisk: (decision) => {
      const riskFactors = {
        high: ['immediate_response', 'show_of_force', 'covert_response'],
        medium: ['bilateral_talks', 'mediation_request', 'logistics_infrastructure'],
        low: ['diplomatic_approach', 'search_rescue_priority', 'medical_humanitarian']
      };
      
      if (riskFactors.high.includes(decision.id)) return 'Alto';
      if (riskFactors.medium.includes(decision.id)) return 'Médio';
      return 'Baixo';
    },

    suggestAlternatives: (decision) => {
      return [
        "Considere uma abordagem híbrida combinando elementos de diferentes estratégias",
        "Analise o timing - uma ação posterior pode ser mais efetiva",
        "Avalie o envolvimento de mais stakeholders na decisão"
      ];
    }
  };

  const collaborativeSystem = {
    createSession: (scenarioId) => {
      const sessionId = `session_${Date.now()}`;
      setCollaborativeSession({
        isActive: true,
        sessionId,
        participants: [
          { id: '1', name: userProfile.name || 'Você', role: 'Commander', vote: null },
          { id: '2', name: 'Ana Silva', role: 'Intelligence Analyst', vote: null },
          { id: '3', name: 'Carlos Santos', role: 'Political Advisor', vote: null }
        ],
        messages: [
          { id: '1', user: 'Sistema', message: 'Sessão colaborativa iniciada', timestamp: new Date() }
        ],
        currentVoter: null
      });
    },

    simulateCollaboration: (decision) => {
      const participants = collaborativeSession.participants.map(p => {
        if (p.id === '1') return { ...p, vote: decision.id };
        
        const aiVote = collaborativeSystem.generateAIVote(p.role, decision);
        return { ...p, vote: aiVote };
      });

      setCollaborativeSession(prev => ({
        ...prev,
        participants,
        messages: [
          ...prev.messages,
          { id: Date.now(), user: 'Ana Silva', message: 'Analisando dados de inteligência...', timestamp: new Date() },
          { id: Date.now() + 1, user: 'Carlos Santos', message: 'Considerando impactos políticos', timestamp: new Date() }
        ]
      }));
    },

    generateAIVote: (role, decision) => {
      const rolePreferences = {
        'Intelligence Analyst': ['covert_response', 'bilateral_talks'],
        'Political Advisor': ['diplomatic_approach', 'mediation_request']
      };
      
      return rolePreferences[role]?.[Math.floor(Math.random() * rolePreferences[role].length)] || decision.id;
    }
  };

  const TutorialSystem = () => {
    const [tutorialStep, setTutorialStep] = useState(0);
    const tutorialSteps = [
      {
        title: "Bem-vindo ao Simulador Avançado",
        content: "Este simulador oferece experiências de tomada de decisão estratégica realistas com IA adaptativa.",
        highlight: "simulator-title"
      },
      {
        title: "Tipos de Simulação",
        content: "Escolha entre 15 tipos diferentes de cenários, cada um com desafios únicos.",
        highlight: "simulation-types"
      },
      {
        title: "Modos de Jogo",
        content: "Jogue sozinho, em campanhas conectadas ou colaborativamente com equipes.",
        highlight: "game-modes"
      },
      {
        title: "Análise com IA",
        content: "Receba insights personalizados baseados em seu histórico de decisões.",
        highlight: "ai-insights"
      }
    ];

    if (!showTutorial) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-xl font-bold mb-4">{tutorialSteps[tutorialStep].title}</h3>
          <p className="mb-6">{tutorialSteps[tutorialStep].content}</p>
          <div className="flex justify-between">
            <button
              onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
              disabled={tutorialStep === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="self-center text-sm text-gray-500">
              {tutorialStep + 1} de {tutorialSteps.length}
            </span>
            {tutorialStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Começar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AdvancedAnalysis = ({ results, userHistory }) => {
    if (!results) return null;

    return (
      <div className="mt-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Brain className="mr-2" /> Análise com IA
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Impacto por Dimensão</h4>
              <div className="space-y-2">
                {Object.entries(results.scores).map(([area, score]) => (
                  <div key={area} className="flex items-center">
                    <span className="w-20 text-sm capitalize">{area}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                      <div 
                        className={`h-2 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Insights da IA</h4>
              {aiInsights && (
                <div className="space-y-2 text-sm">
                  <p><strong>Estilo:</strong> {aiInsights.decisionStyle}</p>
                  <p><strong>Risco:</strong> {aiInsights.riskAssessment}</p>
                  <p><strong>Recomendação:</strong> {aiInsights.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {userHistory && userHistory.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2" /> Evolução das Decisões
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.keys(results.scores).map(area => (
                <div key={area} className="text-center">
                  <div className="text-sm font-medium capitalize mb-1">{area}</div>
                  <div className="text-2xl font-bold">
                    {results.scores[area]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Média: {Math.round(userHistory.reduce((sum, h) => sum + h.scores[area], 0) / userHistory.length)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const saveSystem = {
    saveProgress: () => {
      const saveData = {
        userProfile,
        campaignProgress,
        customScenarios,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strategic_simulator_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    loadProgress: (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target.result);
          setUserProfile(saveData.userProfile || userProfile);
          setCampaignProgress(saveData.campaignProgress || campaignProgress);
          setCustomScenarios(saveData.customScenarios || []);
          alert('Progresso carregado com sucesso!');
        } catch (error) {
          alert('Erro ao carregar arquivo de salvamento');
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (selectedDecision && campaignProgress.decisions.length > 0) {
      const insights = aiAnalyzer.analyzeDecision(selectedDecision, campaignProgress.decisions);
      setAiInsights(insights);
    }
  }, [selectedDecision, campaignProgress.decisions]);

  const executeDecision = (decision) => {
    setSelectedDecision(decision);
    setSimulationResults(decision);
    
    const newDecision = {
      ...decision,
      timestamp: new Date(),
      scenarioId: currentScenario.id
    };
    
    setCampaignProgress(prev => ({
      round: prev.round + 1,
      totalScore: prev.totalScore + Object.values(decision.scores).reduce((sum, score) => sum + score, 0) / 5,
      decisions: [...prev.decisions, newDecision]
    }));

    setUserProfile(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        totalDecisions: prev.statistics.totalDecisions + 1,
        avgScore: ((prev.statistics.avgScore * prev.statistics.totalDecisions) + 
                  (Object.values(decision.scores).reduce((sum, score) => sum + score, 0) / 5)) / 
                  (prev.statistics.totalDecisions + 1)
      }
    }));

    if (collaborativeSession.isActive) {
      collaborativeSystem.simulateCollaboration(decision);
    }
  };

  const startNewSimulation = (typeId) => {
    const scenarios = baseScenarios[typeId] || [];
    if (scenarios.length > 0) {
      setCurrentScenario(scenarios[0]);
      setSelectedDecision(null);
      setSimulationResults(null);
      setAiInsights(null);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'simulator':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Settings className="mr-2" /> Configurações da Simulação
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Modo de Jogo</label>
                  <select 
                    value={gameMode} 
                    onChange={(e) => setGameMode(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="single">Simulação Individual</option>
                    <option value="campaign">Campanha Conectada</option>
                    <option value="collaborative">Colaborativo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nível de Dificuldade</label>
                  <select 
                    value={difficultyLevel} 
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Ações</label>
                  <div className="flex space-x-2">
                    <button 
                      onClick={saveSystem.saveProgress}
                      className="flex-1 bg-green-500 text-white p-2 rounded-lg text-sm flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1" /> Salvar
                    </button>
                    <label className="flex-1 bg-blue-500 text-white p-2 rounded-lg text-sm flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                      <Upload className="w-4 h-4 mr-1" /> Carregar
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={saveSystem.loadProgress} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {gameMode === 'campaign' && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Award className="mr-2" /> Progresso da Campanha
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{campaignProgress.round}</div>
                      <div className="text-gray-600">Rodada Atual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(campaignProgress.totalScore)}</div>
                      <div className="text-gray-600">Pontuação Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{campaignProgress.decisions.length}</div>
                      <div className="text-gray-600">Decisões Tomadas</div>
                    </div>
                  </div>
                </div>
              )}

              {gameMode === 'collaborative' && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Users className="mr-2" /> Sessão Colaborativa
                  </h4>
                  {collaborativeSession.isActive ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sessão: {collaborativeSession.sessionId}</span>
                        <span className="text-sm text-green-600">● Ativo</span>
                      </div>
                      <div className="flex space-x-2">
                        {collaborativeSession.participants.map(p => (
                          <div key={p.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {p.name} ({p.role})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => collaborativeSystem.createSession(currentScenario?.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      Criar Sessão Colaborativa
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Tipos de Simulação</h3>
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Categorias Disponíveis:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  <li><strong>📋 Continuidade de Apoio</strong> - Decisões sobre manutenção de operações</li>
                  <li><strong>🔗 Coordenação de Células</strong> - Integração entre diferentes unidades operacionais</li>
                  <li><strong>🛡️ Desinformação</strong> - Gestão de campanhas de informação falsa</li>
                  <li><strong>🔍 Detecção de Deepfake</strong> - Identificação de conteúdo manipulado</li>
                  <li><strong>🤝 Engajamento Civil</strong> - Interação com populações pós-conflito</li>
                  <li><strong>🏖️ Engajamento Costeiro</strong> - Trabalho com comunidades marítimas</li>
                  <li><strong>📢 Mensagens de Dissuasão</strong> - Desenvolvimento de comunicação estratégica</li>
                  <li><strong>🏗️ Priorização de Infraestrutura</strong> - Gestão de recursos críticos</li>
                  <li><strong>🔄 Transição de Autoridades</strong> - Transferência para governo civil</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simulationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => startNewSimulation(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      difficultyLevel !== 'advanced' && type.difficulty === 'high' 
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                    }`}
                    disabled={difficultyLevel !== 'advanced' && type.difficulty === 'high'}
                  >
                    <div className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
                      <span>{type.emoji} {type.name}</span>
                      {type.difficulty === 'high' && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Avançado
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {currentScenario && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Target className="mr-2" /> {currentScenario.title}
                  </h2>
                  {currentScenario.timeLimit && (
                    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{currentScenario.timeLimit}s</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Situação</h3>
                  <p className="text-gray-700 mb-4">{currentScenario.description}</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Contexto Detalhado</h4>
                    <p className="text-blue-700">{currentScenario.context}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Users className="mr-2" /> Partes Interessadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentScenario.stakeholders.map((stakeholder, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {stakeholder}
                      </span>
                    ))}
                  </div>
                </div>

                {collaborativeSession.isActive && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <MessageCircle className="mr-2" /> Discussão da Equipe
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      {collaborativeSession.messages.map(msg => (
                        <div key={msg.id} className="mb-2 text-sm">
                          <span className="font-medium">{msg.user}:</span> {msg.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Opções Estratégicas</h3>
                  <div className="space-y-4">
                    {currentScenario.options.map((option, index) => (
                      <div
                        key={option.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedDecision?.id === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => executeDecision(option)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Opção {index + 1}: {option.text}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-700">Curto prazo:</span>
                                <p className="text-gray-600">{option.consequences.short}</p>
                              </div>
                              <div>
                                <span className="font-medium text-yellow-700">Médio prazo:</span>
                                <p className="text-gray-600">{option.consequences.medium}</p>
                              </div>
                              <div>
                                <span className="font-medium text-red-700">Longo prazo:</span>
                                <p className="text-gray-600">{option.consequences.long}</p>
                              </div>
                            </div>
                          </div>
                          {collaborativeSession.isActive && (
                            <div className="ml-4">
                              <div className="text-xs text-gray-500 mb-1">Votos da equipe:</div>
                              <div className="flex space-x-1">
                                {collaborativeSession.participants.map(p => (
                                  <div key={p.id} className={`w-3 h-3 rounded-full ${
                                    p.vote === option.id ? 'bg-green-500' : 'bg-gray-300'
                                  }`} title={p.name} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AdvancedAnalysis results={simulationResults} userHistory={campaignProgress.decisions} />

                {gameMode === 'campaign' && simulationResults && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <ChevronRight className="mr-2" /> Próximo Cenário
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Suas decisões influenciarão o próximo cenário da campanha.
                    </p>
                    <button 
                      onClick={() => startNewSimulation(currentScenario.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      Continuar Campanha
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-2" /> Análise de Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{userProfile.statistics.totalDecisions}</div>
                  <div className="text-sm text-gray-600">Decisões Tomadas</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{Math.round(userProfile.statistics.avgScore)}</div>
                  <div className="text-sm text-gray-600">Pontuação Média</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">{campaignProgress.round - 1}</div>
                  <div className="text-sm text-gray-600">Campanhas Completadas</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {aiInsights?.decisionStyle || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Estilo de Liderança</div>
                </div>
              </div>

              {campaignProgress.decisions.length > 0 && (
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Histórico de Decisões</h3>
                  <div className="space-y-3">
                    {campaignProgress.decisions.slice(-5).map((decision, index) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-4">
                        <div className="font-medium">{decision.text}</div>
                        <div className="text-sm text-gray-600">
                          Pontuação: {Math.round(Object.values(decision.scores).reduce((sum, score) => sum + score, 0) / 5)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(decision.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiInsights && (
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Brain className="mr-2" /> Recomendações da IA
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Áreas de Força</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.strengthAreas.map(area => (
                          <span key={area} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm capitalize">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Áreas para Desenvolvimento</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.improvementAreas.map(area => (
                          <span key={area} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm capitalize">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Sugestão Principal</h4>
                      <p className="text-gray-700">{aiInsights.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <BookOpen className="mr-2" /> Centro Educacional
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Globe className="mr-2" /> Casos Históricos
                  </h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium">Crise dos Mísseis de Cuba (1962)</h4>
                      <p className="text-sm text-gray-600">
                        Exemplo clássico de tomada de decisão sob pressão extrema e risco nuclear.
                      </p>
                      <button className="text-blue-600 text-sm hover:underline mt-1">
                        Estudar caso →
                      </button>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium">Operação Tempestade no Deserto (1991)</h4>
                      <p className="text-sm text-gray-600">
                        Coordenação internacional e uso de tecnologia militar avançada.
                      </p>
                      <button className="text-blue-600 text-sm hover:underline mt-1">
                        Estudar caso →
                      </button>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium">Resposta ao 11 de Setembro (2001)</h4>
                      <p className="text-sm text-gray-600">
                        Gestão de crise nacional e mudanças na política de segurança.
                      </p>
                      <button className="text-blue-600 text-sm hover:underline mt-1">
                        Estudar caso →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Shield className="mr-2" /> Frameworks de Decisão
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">Modelo OODA Loop</h4>
                      <p className="text-sm text-gray-600">Observe → Orient → Decide → Act</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">Análise SWOT Estratégica</h4>
                      <p className="text-sm text-gray-600">Strengths, Weaknesses, Opportunities, Threats</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">Teoria dos Jogos</h4>
                      <p className="text-sm text-gray-600">Análise de interações estratégicas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Zap className="mr-2" /> Tutoriais Interativos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setShowTutorial(true)}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <div className="text-center">
                      <Play className="mx-auto mb-2" />
                      <h4 className="font-medium">Introdução ao Simulador</h4>
                      <p className="text-sm text-gray-600">Aprenda a usar todas as funcionalidades</p>
                    </div>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Target className="mx-auto mb-2" />
                      <h4 className="font-medium">Tomada de Decisão Estratégica</h4>
                      <p className="text-sm text-gray-600">Princípios fundamentais</p>
                    </div>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Users className="mx-auto mb-2" />
                      <h4 className="font-medium">Liderança em Crise</h4>
                      <p className="text-sm text-gray-600">Gestão de equipes sob pressão</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Settings className="mr-2" /> Cenários Customizados
              </h2>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Criar Novo Cenário</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título do Cenário</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Crise Diplomática Regional"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea 
                      placeholder="Descreva a situação inicial..."
                      className="w-full p-3 border rounded-lg h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Contexto Detalhado</label>
                    <textarea 
                      placeholder="Informações adicionais e background..."
                      className="w-full p-3 border rounded-lg h-32"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <select className="w-full p-3 border rounded-lg">
                        <option value="">Selecione uma categoria</option>
                        {simulationTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tempo Limite (segundos)</label>
                      <input 
                        type="number" 
                        placeholder="300"
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Stakeholders (separados por vírgula)</label>
                    <input 
                      type="text" 
                      placeholder="Governo, Oposição, Mídia, População Civil"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Opções de Decisão</h4>
                    <div className="space-y-4">
                      {[1, 2, 3].map(num => (
                        <div key={num} className="bg-white p-4 rounded border">
                          <h5 className="font-medium mb-2">Opção {num}</h5>
                          <input 
                            type="text" 
                            placeholder="Texto da opção..."
                            className="w-full p-2 border rounded mb-2"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input 
                              type="text" 
                              placeholder="Consequência curto prazo"
                              className="p-2 border rounded text-sm"
                            />
                            <input 
                              type="text" 
                              placeholder="Consequência médio prazo"
                              className="p-2 border rounded text-sm"
                            />
                            <input 
                              type="text" 
                              placeholder="Consequência longo prazo"
                              className="p-2 border rounded text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                      Salvar Cenário
                    </button>
                    <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
                      Testar Cenário
                    </button>
                  </div>
                </div>
              </div>
              
              {customScenarios.length > 0 && (
                <div className="bg-white p-6 rounded-lg mt-6">
                  <h3 className="text-xl font-semibold mb-4">Seus Cenários</h3>
                  <div className="space-y-3">
                    {customScenarios.map((scenario, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{scenario.title}</h4>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:underline text-sm">Editar</button>
                          <button className="text-green-600 hover:underline text-sm">Jogar</button>
                          <button className="text-red-600 hover:underline text-sm">Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <TutorialSystem />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Target className="mr-3" /> Simulador de Decisão Estratégica Avançado
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Plataforma completa com IA adaptativa, análise avançada, modo colaborativo e sistema educacional integrado
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'simulator', label: 'Simulador', icon: Play },
            { id: 'analytics', label: 'Análise', icon: BarChart3 },
            { id: 'education', label: 'Educação', icon: BookOpen },
            { id: 'custom', label: 'Personalizar', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderMainContent()}
    </div>
  );
};

export default AdvancedStrategicSimulator;
