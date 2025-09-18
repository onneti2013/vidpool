/**
 * WordSubtitleAnimator.js
 * Sistema de legendas animadas palavra por palavra estilo TikTok
 * Integra-se perfeitamente com o CapCutStyleGenerator existente
 */

class WordSubtitleAnimator {
    constructor() {
        this.app = null;
        this.container = null;
        this.wordElements = [];
        this.timeline = [];
        this.currentWordIndex = 0;
        this.isInitialized = false;
        
        // Configurações visuais estilo TikTok
        this.config = {
            fontSize: 48,
            fontFamily: 'Arial Black, sans-serif',
            fontWeight: 900,
            fillColor: 0xFFFFFF,
            strokeColor: 0x000000,
            strokeThickness: 4,
            dropShadowColor: 0x000000,
            dropShadowAlpha: 0.8,
            dropShadowDistance: 3,
            dropShadowBlur: 2,
            
            // Animações
            popScale: 1.2,
            popDuration: 0.15,
            fadeDuration: 0.1,
            
            // Posicionamento
            maxWidth: 380,
            lineHeight: 1.2,
            bottomMargin: 120,
            wordsPerLine: 4
        };
    }

    /**
     * Inicializa o sistema de legendas
     * @param {CapCutStyleGenerator} renderer - Instância do renderizador principal
     */
    init(renderer) {
        if (!renderer || !renderer.app) {
            throw new Error('Renderer inválido ou não inicializado');
        }
        
        this.app = renderer.app;
        this.setupContainer();
        this.isInitialized = true;
        
        console.log('✅ WordSubtitleAnimator inicializado');
    }

    /**
     * Configura o container das legendas
     */
    setupContainer() {
        // Remove container anterior se existir
        if (this.container) {
            this.app.stage.removeChild(this.container);
        }
        
        this.container = new PIXI.Container();
        this.container.name = 'subtitles-container';
        
        // Posiciona no centro-inferior da tela
        this.container.x = this.app.screen.width / 2;
        this.container.y = this.app.screen.height - this.config.bottomMargin;
        
        // Adiciona ao stage no topo (última camada)
        this.app.stage.addChild(this.container);
    }

    /**
     * Define os dados de timeline das palavras
     * @param {Array|Object} data - Segmentos do Whisper ou dados completos da transcrição
     */
    setTimeline(data) {
        console.log('🔍 Recebendo dados para timeline:', data);
        
        this.timeline = [];
        
        // Se receber o objeto completo da transcrição
        if (data.words && Array.isArray(data.words)) {
            console.log('📝 Usando array de palavras direto');
            data.words.forEach(wordData => {
                this.timeline.push({
                    word: wordData.word.trim(),
                    start: wordData.start,
                    end: wordData.end,
                    duration: wordData.end - wordData.start
                });
            });
        }
        // Se receber array de segmentos
        else if (Array.isArray(data)) {
            console.log('📝 Processando segmentos');
            data.forEach(segment => {
                if (segment.words) {
                    segment.words.forEach(wordData => {
                        this.timeline.push({
                            word: wordData.word.trim(),
                            start: wordData.start,
                            end: wordData.end,
                            duration: wordData.end - wordData.start
                        });
                    });
                }
            });
        }
        
        console.log(`📝 Timeline carregada: ${this.timeline.length} palavras`);
        console.log('📝 Primeiras 3 palavras:', this.timeline.slice(0, 3));
        
        if (this.timeline.length > 0) {
            this.createWordElements();
        } else {
            console.warn('⚠️ Nenhuma palavra encontrada na timeline');
        }
    }

    /**
     * Cria os elementos visuais para todas as palavras
     */
    createWordElements() {
        // Limpa elementos anteriores
        this.wordElements.forEach(element => {
            if (element.parent) {
                element.parent.removeChild(element);
            }
        });
        this.wordElements = [];

        // Cria uma palavra por vez (estilo TikTok clássico)
        this.timeline.forEach((wordData, index) => {
            const textElement = this.createWordElement(wordData, index);
            
            // Posiciona no centro da tela
            textElement.x = 0;
            textElement.y = 0;
            
            // Inicialmente invisível
            textElement.alpha = 0;
            textElement.scale.set(0.8);
            
            this.container.addChild(textElement);
            this.wordElements.push(textElement);
        });
        
        console.log(`📝 Criados ${this.wordElements.length} elementos de palavra (modo TikTok)`);
    }

    /**
     * Cria elemento visual para uma palavra
     */
    createWordElement(wordData, index) {
        // Cria texto com estilo TikTok
        const textStyle = new PIXI.TextStyle({
            fontFamily: this.config.fontFamily,
            fontSize: this.config.fontSize,
            fontWeight: this.config.fontWeight,
            fill: this.config.fillColor,
            stroke: this.config.strokeColor,
            strokeThickness: this.config.strokeThickness,
            dropShadow: true,
            dropShadowColor: this.config.dropShadowColor,
            dropShadowAlpha: this.config.dropShadowAlpha,
            dropShadowDistance: this.config.dropShadowDistance,
            dropShadowBlur: this.config.dropShadowBlur,
            wordWrap: false
        });

        const textElement = new PIXI.Text(wordData.word, textStyle);
        textElement.anchor.set(0.5, 0.5);
        
        // Configurações iniciais
        textElement.alpha = 0; // Completamente invisível inicialmente
        textElement.scale.set(0.8);
        
        // Guarda dados da palavra no elemento
        textElement.wordData = wordData;
        textElement.wordIndex = index;
        textElement.isActive = false;
        
        return textElement;
    }

    /**
     * Inicia a animação sincronizada com o áudio
     * @param {HTMLAudioElement} audioElement - Elemento de áudio
     */
    startAnimation(audioElement) {
        if (!this.isInitialized) {
            console.warn('⚠️ WordSubtitleAnimator não foi inicializado');
            return;
        }
        
        console.log('🎬 Iniciando animação de legendas');
        console.log('🎬 Elemento de áudio:', audioElement);
        console.log('🎬 Total de elementos criados:', this.wordElements.length);
        
        // Reset
        this.currentWordIndex = 0;
        this.resetAllWords();
        
        // Torna o container visível para debug
        this.container.visible = true;
        console.log('📺 Container das legendas:', this.container);
        
        // Sincroniza com o áudio
        this.syncWithAudio(audioElement);
    }

    /**
     * Sincroniza animação com reprodução de áudio
     */
    syncWithAudio(audioElement) {
        console.log('🔄 Iniciando sincronização com áudio');
        
        let animationId;
        
        const updateSubtitles = () => {
            if (audioElement.paused || audioElement.ended) {
                console.log('⏸️ Áudio pausado ou finalizado');
                return;
            }
            
            const currentTime = audioElement.currentTime;
            this.updateWordStates(currentTime);
            
            animationId = requestAnimationFrame(updateSubtitles);
        };
        
        // Inicia o loop de atualização
        updateSubtitles();
        
        // Força o áudio a tocar se não estiver tocando
        if (audioElement.paused) {
            console.log('▶️ Forçando reprodução do áudio');
            audioElement.play().catch(e => {
                console.warn('⚠️ Não foi possível reproduzir automaticamente:', e);
            });
        }
        
        // Event listeners para controlar o loop
        audioElement.addEventListener('play', () => {
            console.log('▶️ Áudio iniciado - reiniciando loop de legendas');
            updateSubtitles();
        });
        
        audioElement.addEventListener('pause', () => {
            console.log('⏸️ Áudio pausado - parando loop de legendas');
            if (animationId) cancelAnimationFrame(animationId);
        });
        
        audioElement.addEventListener('ended', () => {
            console.log('⏹️ Áudio finalizado - resetando legendas');
            if (animationId) cancelAnimationFrame(animationId);
            this.resetAllWords();
        });
    }

    /**
     * Atualiza estado das palavras baseado no tempo atual
     */
    updateWordStates(currentTime) {
        let currentActiveElement = null;
        
        // Encontra qual palavra deve estar ativa neste momento
        this.wordElements.forEach((element) => {
            const wordData = element.wordData;
            const isInTimeRange = currentTime >= wordData.start && currentTime <= wordData.end;
            
            if (isInTimeRange) {
                currentActiveElement = element;
            }
        });
        
        // Se tem uma palavra que deveria estar ativa
        if (currentActiveElement) {
            // Se essa palavra ainda não está ativa
            if (!currentActiveElement.isActive) {
                // PRIMEIRO: Desativa TODAS as outras palavras IMEDIATAMENTE
                this.wordElements.forEach((element) => {
                    if (element !== currentActiveElement && element.isActive) {
                        element.isActive = false;
                        element.alpha = 0;
                        element.visible = false;
                    }
                });
                
                // SEGUNDO: Ativa APENAS a palavra atual
                console.log(`✨ Ativando palavra: "${currentActiveElement.wordData.word}"`);
                this.activateWord(currentActiveElement);
            }
        } else {
            // Se não tem palavra ativa, desativa todas
            this.wordElements.forEach((element) => {
                if (element.isActive) {
                    element.isActive = false;
                    element.alpha = 0;
                    element.visible = false;
                }
            });
        }
    }

    /**
     * Anima ativação de uma palavra
     */
    activateWord(element) {
        element.isActive = true;
        element.visible = true;
        
        // Animação de entrada
        const startTime = Date.now();
        const duration = 300;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress < 1) {
                const easeBack = 1 - Math.pow(1 - progress, 3) * (1 - Math.sin(progress * Math.PI * 2) * 0.2);
                element.scale.set(0.8 + easeBack * 0.4);
                element.alpha = progress;
                requestAnimationFrame(animate);
            } else {
                element.scale.set(1.1);
                element.alpha = 1;
            }
        };
        
        animate();
    }

    /**
     * Anima desativação de uma palavra - Saída INSTANTÂNEA
     */
    deactivateWord(element) {
        element.isActive = false;
        
        // Cancela animação anterior se existir
        if (element.currentTween) {
            element.currentTween.destroy();
            element.currentTween = null;
        }
        
        // Remove IMEDIATAMENTE - sem animação
        element.alpha = 0;
        element.scale.set(0.8);
        element.visible = false; // Força invisibilidade total
    }

    /**
     * Reseta todas as palavras para estado inicial
     */
    resetAllWords() {
        this.wordElements.forEach(element => {
            element.alpha = 0; // Todas invisíveis inicialmente
            element.scale.set(0.8);
            element.isActive = false;
            
            // Cancela qualquer animação em andamento
            if (element.currentTween) {
                element.currentTween.destroy();
                element.currentTween = null;
            }
        });
    }

    /**
     * Atualiza configurações visuais
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        if (this.isInitialized) {
            this.createWordElements();
        }
    }

    /**
     * Remove o sistema de legendas
     */
    destroy() {
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
        
        this.wordElements = [];
        this.timeline = [];
        this.isInitialized = false;
        
        console.log('🗑️ WordSubtitleAnimator removido');
    }
}

// Exporta para uso global
window.WordSubtitleAnimator = WordSubtitleAnimator;