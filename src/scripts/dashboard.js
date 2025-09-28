// Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const startEvaluationBtn = document.getElementById('startEvaluation');
    
    // Event Listeners
    startEvaluationBtn.addEventListener('click', function() {
        // Add loading animation
        startEvaluationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        startEvaluationBtn.disabled = true;
        
        // Simulate loading and redirect
        setTimeout(() => {
            window.open('src/form.html', '_blank');
            
            // Reset button
            setTimeout(() => {
                startEvaluationBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar Avaliação';
                startEvaluationBtn.disabled = false;
            }, 1000);
        }, 500);
    });
    
    // Add smooth animations for cards
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Add info cards animation
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${(index * 0.1) + 0.3}s`;
        observer.observe(card);
    });
});