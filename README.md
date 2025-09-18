MAKE SIMPLE HTML


<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VidPool - Workflow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/onneti2013/vidpool/base.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/onneti2013/vidpool/CapCutStyleGenerator.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/onneti2013/vidpool/WordSubtitleAnimator.js"></script>
</head>
<body>

<div class="container">
    <h1>Gerador de Vídeo</h1>
    
    <div class="progress-bar">
        <div class="progress-step active" data-step="1">1</div>
        <div class="progress-step" data-step="2">2</div>
        <div class="progress-step" data-step="3">3</div>
        <div class="progress-step" data-step="4">4</div>
    </div>

    <div id="step-theme-input" class="step visible">
        <h2>1. Qual o tema do vídeo?</h2>
        <textarea id="theme-input" placeholder="Ex: A história da Torre Eiffel"></textarea>
        <button id="generate-script-btn">Gerar Roteiro</button>
    </div>

    <div id="step-script-review" class="step">
        <h2>2. Roteiro Sugerido</h2>
        <p>Use este roteiro como base para gravar sua narração.</p>
        <textarea id="script-output" readonly></textarea>
        <button id="go-to-audio-step-btn">Gravei o áudio, avançar</button>
        <button id="copy-script-btn" class="btn-secondary">Copiar Roteiro</button>
    </div>

    <div id="step-audio-selection" class="step">
        <h2>3. Selecione o arquivo de áudio</h2>
        <p>Envie a narração que você gravou.</p>
        <input type="file" id="audio-input" accept="audio/*">
        <button id="process-video-btn" disabled>Iniciar Geração do Vídeo</button>
    </div>
    
    <div id="step-generating-video" class="step">
         <h2 id="generation-title">Gerando seu vídeo</h2>
         <p id="generation-status">Preparando tudo, aguarde um instante...</p>
         <div class="loading-dots">
            <span class="dot1"></span>
            <span class="dot2"></span>
            <span class="dot3"></span>
         </div>
         <div id="pixi-container" style="width: 405px; height: 720px; margin: auto; background: #000;"></div>
    </div>

    <div id="final-video-container" class="step">
        <h2>🎉 Vídeo Concluído! 🎉</h2>
        <p>Seu vídeo está pronto para ser baixado ou compartilhado.</p>
        <video id="final-video-player" controls></video>
        <button onclick="window.location.reload()">Criar Novo Vídeo</button>
    </div>
</div>

ADD API KEY

<script>
    const GEMINI_API_KEY = "FREE API GEMINI";
    const GROQ_API_KEY = "FREE API GROQ CLOUD";
</script>

<script src="https://cdn.jsdelivr.net/gh/onneti2013/vidpool/base.js"></script>

</body>
</html>
