document.addEventListener('DOMContentLoaded', function() {
    // Manipulação do botão de vídeo
    const videoButton = document.getElementById('videoButton');
    if (videoButton) {
        videoButton.addEventListener('click', function() {
            // Aqui você pode adicionar a lógica para iniciar o vídeo
            // Por exemplo, substituir o placeholder por um iframe de vídeo
            const videoContainer = document.querySelector('.video-placeholder');
            
            // Exemplo: substituir por um iframe do YouTube (você precisaria adicionar o ID do vídeo real)
            videoContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1" 
                    title="Curso de Edição de Vídeos" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    style="aspect-ratio: 16/9;"
                ></iframe>
            `;
        });
    }

    // Animação suave de rolagem para links de âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Validação do formulário
    const form = document.querySelector('.signup-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aqui você pode adicionar a lógica para enviar os dados do formulário
            // Por exemplo, usando fetch para enviar para um endpoint de API
            
            const formData = new FormData(form);
            const formValues = Object.fromEntries(formData.entries());
            
            // Exemplo de como você poderia enviar os dados (descomentado quando tiver um endpoint real)
            /*
            fetch('https://seu-endpoint-api.com/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues),
            })
            .then(response => response.json())
            .then(data => {
                // Redirecionar para página de agradecimento ou mostrar mensagem de sucesso
                alert('Inscrição realizada com sucesso! Em breve entraremos em contato.');
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.');
            });
            */
            
            // Por enquanto, apenas mostrar uma mensagem de sucesso
            alert('Inscrição realizada com sucesso! Em breve entraremos em contato.');
            form.reset();
        });
    }

    // Contador regressivo (opcional)
    function startCountdown() {
        const countdownElement = document.createElement('div');
        countdownElement.className = 'countdown';
        countdownElement.innerHTML = `
            <p>Oferta por tempo limitado! Encerra em:</p>
            <div class="countdown-timer">
                <span id="hours">24</span>h
                <span id="minutes">00</span>m
                <span id="seconds">00</span>s
            </div>
        `;
        
        // Inserir antes do formulário
        const offerSection = document.querySelector('.offer');
        if (offerSection) {
            const priceContainer = offerSection.querySelector('.price-container');
            if (priceContainer) {
                offerSection.insertBefore(countdownElement, priceContainer);
            }
        }
        
        // Lógica do contador
        let hours = 24;
        let minutes = 0;
        let seconds = 0;
        
        const countdownInterval = setInterval(function() {
            if (seconds > 0) {
                seconds--;
            } else {
                if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else {
                    if (hours > 0) {
                        hours--;
                        minutes = 59;
                        seconds = 59;
                    } else {
                        clearInterval(countdownInterval);
                        // Quando o contador chegar a zero, você pode mostrar uma mensagem ou fazer algo
                    }
                }
            }
            
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }, 1000);
    }
    
    // Descomente a linha abaixo se quiser ativar o contador regressivo
    // startCountdown();

    // Adicionar efeito de aparecimento ao rolar a página
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Adicionar classe para elementos que queremos animar
    document.querySelectorAll('.benefit-card, .testimonial-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Adicionar estilos CSS para a animação
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .countdown {
            text-align: center;
            margin-bottom: 30px;
            background-color: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
        }
        
        .countdown-timer {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 10px;
        }
        
        .countdown-timer span {
            display: inline-block;
            background-color: #4caf50;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            margin: 0 5px;
        }
    `;
    document.head.appendChild(style);
}); 