// Form Script - Escala Conjugal
class EscalaConjugal {
    constructor() {
        this.currentPerson = 1; // 1 for first person, 2 for second person
        this.responses = {
            person1: null,
            person2: null
        };
        
        this.questions = [
            "Sinto que meu cônjuge me entende.",
            "Sinto que meu cônjuge me respeita.",
            "Sinto que meu cônjuge me apoia emocionalmente.",
            "Sinto que meu cônjuge valoriza minhas opiniões.",
            "Sinto que meu cônjuge compartilha responsabilidades.",
            "Sinto que meu cônjuge demonstra carinho.",
            "Sinto que meu cônjuge é honesto comigo.",
            "Sinto que meu cônjuge se comunica abertamente.",
            "Sinto que meu cônjuge me faz sentir especial.",
            "Sinto que meu cônjuge respeita meu espaço pessoal.",
            "Sinto que meu cônjuge me apoia em decisões importantes.",
            "Sinto que meu cônjuge é leal.",
            "Sinto que meu cônjuge compartilha interesses comigo.",
            "Sinto que meu cônjuge me incentiva a crescer.",
            "Sinto que meu cônjuge é paciente comigo.",
            "Sinto que meu cônjuge me escuta atentamente.",
            "Sinto que meu cônjuge respeita meus sentimentos.",
            "Sinto que meu cônjuge me ajuda em momentos difíceis.",
            "Sinto que meu cônjuge é justo nas discussões.",
            "Sinto que meu cônjuge demonstra gratidão.",
            "Sinto que meu cônjuge me faz sentir seguro(a).",
            "Sinto que meu cônjuge valoriza nosso relacionamento.",
            "Sinto que meu cônjuge me apoia nos meus sonhos.",
            "Sinto que meu cônjuge respeita meus limites."
        ];
        
        this.options = [
            { value: 1, text: "Eu Gostaria que fosse Diferente" },
            { value: 2, text: "Eu Gostaria que fosse um pouco diferente" },
            { value: 3, text: "Eu gosto de como tem sido" }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderQuestions();
        this.updateProgress();
    }
    
    bindEvents() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.close();
        });
        
        // Form submission
        document.getElementById('evaluationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
        
        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
            window.close();
        });
        
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.hideModal();
            this.startSecondPersonForm();
        });
        
        // Results actions
        document.getElementById('savePdfBtn').addEventListener('click', () => {
            this.generatePDF();
        });
        
        document.getElementById('newEvaluationBtn').addEventListener('click', () => {
            this.resetEvaluation();
        });
        
        // Update progress on input change
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' || e.target.type === 'text' || e.target.type === 'number') {
                this.updateProgress();
                this.updateRadioStyles(e.target);
            }
        });
    }
    
    renderQuestions() {
        const questionsGrid = document.getElementById('questionsGrid');
        questionsGrid.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = `${index + 1}. ${question}`;
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'question-options';
            
            this.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'radio-option';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question_${index + 1}`;
                input.value = option.value;
                input.id = `q${index + 1}_${option.value}`;
                input.required = true;
                
                const label = document.createElement('label');
                label.htmlFor = input.id;
                label.textContent = option.text;
                
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                optionsDiv.appendChild(optionDiv);
                
                // Add click event to option div
                optionDiv.addEventListener('click', () => {
                    input.checked = true;
                    this.updateRadioStyles(input);
                    this.updateProgress();
                });
            });
            
            questionDiv.appendChild(questionText);
            questionDiv.appendChild(optionsDiv);
            questionsGrid.appendChild(questionDiv);
        });
    }
    
    updateRadioStyles(changedInput) {
        if (changedInput.type === 'radio') {
            // Remove selected class from all options in this question
            const questionName = changedInput.name;
            const allOptionsInQuestion = document.querySelectorAll(`input[name="${questionName}"]`);
            
            allOptionsInQuestion.forEach(input => {
                input.closest('.radio-option').classList.remove('selected');
            });
            
            // Add selected class to chosen option
            if (changedInput.checked) {
                changedInput.closest('.radio-option').classList.add('selected');
            }
        }
    }
    
    updateProgress() {
        const form = document.getElementById('evaluationForm');
        const formData = new FormData(form);
        
        // Count filled personal info
        const nameField = document.getElementById('fullName').value.trim();
        const ageField = document.getElementById('age').value;
        const personalInfoFilled = nameField !== '' && ageField !== '' ? 2 : (nameField !== '' || ageField !== '' ? 1 : 0);
        
        // Count answered questions
        const answeredQuestions = new Set();
        for (let [key, value] of formData.entries()) {
            if (key.startsWith('question_')) {
                answeredQuestions.add(key);
            }
        }
        
        const totalItems = 2 + this.questions.length; // 2 personal info fields + questions
        const filledItems = personalInfoFilled + answeredQuestions.size;
        const progress = Math.round((filledItems / totalItems) * 100);
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${progress}%`;
    }
    
    handleFormSubmission() {
        const form = document.getElementById('evaluationForm');
        const formData = new FormData(form);
        
        // Validate form
        if (!this.validateForm(formData)) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // Collect responses
        const responses = {
            name: formData.get('fullName'),
            age: parseInt(formData.get('age')),
            answers: {}
        };
        
        this.questions.forEach((question, index) => {
            const answer = formData.get(`question_${index + 1}`);
            responses.answers[index + 1] = {
                question: question,
                value: parseInt(answer),
                text: this.options.find(opt => opt.value == answer).text
            };
        });
        
        // Store responses
        this.responses[`person${this.currentPerson}`] = responses;
        
        if (this.currentPerson === 1) {
            this.showConfirmationModal();
        } else {
            this.showResults();
        }
    }
    
    validateForm(formData) {
        const name = formData.get('fullName');
        const age = formData.get('age');
        
        if (!name || !age) {
            return false;
        }
        
        // Check if all questions are answered
        for (let i = 1; i <= this.questions.length; i++) {
            if (!formData.get(`question_${i}`)) {
                return false;
            }
        }
        
        return true;
    }
    
    showConfirmationModal() {
        document.getElementById('confirmationModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }
    
    hideModal() {
        document.getElementById('confirmationModal').classList.remove('active');
        document.getElementById('loadingModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }
    
    startSecondPersonForm() {
        this.currentPerson = 2;
        
        // Update form title
        document.getElementById('formTitle').textContent = 'Segunda Pessoa - Dados Pessoais';
        
        // Clear form
        document.getElementById('evaluationForm').reset();
        
        // Clear radio selections
        document.querySelectorAll('.radio-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Update submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Analisar';
        
        // Reset progress
        this.updateProgress();
        
        // Show loading modal briefly
        document.getElementById('loadingModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
        
        setTimeout(() => {
            this.hideModal();
        }, 1000);
    }
    
    showResults() {
        // Hide form section
        document.getElementById('formSection').classList.remove('active');
        
        // Show results section
        document.getElementById('resultsSection').classList.add('active');
        
        // Generate results content
        this.generateResultsContent();
    }
    
    generateResultsContent() {
        const resultsContent = document.getElementById('resultsContent');
        resultsContent.innerHTML = '';
        
        // Generate content for both persons
        [1, 2].forEach(personNum => {
            const person = this.responses[`person${personNum}`];
            if (!person) return;
            
            const personDiv = document.createElement('div');
            personDiv.className = 'person-results';
            
            // Person info
            const personInfo = document.createElement('div');
            personInfo.className = 'person-info';
            personInfo.innerHTML = `
                <h3><i class="fas fa-user"></i> ${person.name}</h3>
                <span class="age">${person.age} anos</span>
            `;
            
            // Answers grid
            const answersGrid = document.createElement('div');
            answersGrid.className = 'answers-grid';
            
            Object.values(person.answers).forEach((answer, index) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-item';
                answerDiv.innerHTML = `
                    <div class="answer-question">${index + 1}. ${answer.question}</div>
                    <div class="answer-response">${answer.text}</div>
                `;
                answersGrid.appendChild(answerDiv);
            });
            
            personDiv.appendChild(personInfo);
            personDiv.appendChild(answersGrid);
            resultsContent.appendChild(personDiv);
        });
        
        // Add comparison summary
        this.addComparisonSummary(resultsContent);
    }
    
    addComparisonSummary(container) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'comparison-summary';
        summaryDiv.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            margin-top: 2rem;
        `;
        
        let agreements = 0;
        let totalQuestions = this.questions.length;
        
        // Calculate agreements
        if (this.responses.person1 && this.responses.person2) {
            for (let i = 1; i <= totalQuestions; i++) {
                const answer1 = this.responses.person1.answers[i]?.value;
                const answer2 = this.responses.person2.answers[i]?.value;
                if (answer1 === answer2) {
                    agreements++;
                }
            }
        }
        
        const agreementPercentage = Math.round((agreements / totalQuestions) * 100);
        
        summaryDiv.innerHTML = `
            <h3><i class="fas fa-chart-pie"></i> Resumo Comparativo</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${agreements}</div>
                    <div>Respostas Iguais</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${totalQuestions - agreements}</div>
                    <div>Respostas Diferentes</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${agreementPercentage}%</div>
                    <div>Concordância</div>
                </div>
            </div>
        `;
        
        container.appendChild(summaryDiv);
    }
    
    async generatePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Show loading
        document.getElementById('loadingModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
        
        try {
            // PDF Header
            pdf.setFontSize(20);
            pdf.setTextColor(102, 126, 234);
            pdf.text('Relatório - Escala Conjugal', 20, 30);
            
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
            
            let yPosition = 60;
            
            // Add results for both persons
            [1, 2].forEach((personNum) => {
                const person = this.responses[`person${personNum}`];
                if (!person) return;
                
                // Person header
                pdf.setFontSize(16);
                pdf.setTextColor(102, 126, 234);
                pdf.text(`${personNum === 1 ? 'Primeira' : 'Segunda'} Pessoa: ${person.name} (${person.age} anos)`, 20, yPosition);
                yPosition += 15;
                
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                
                // Add answers
                Object.values(person.answers).forEach((answer, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    const questionText = `${index + 1}. ${answer.question}`;
                    const responseText = `Resposta: ${answer.text}`;
                    
                    // Question (wrap text if needed)
                    const questionLines = pdf.splitTextToSize(questionText, 170);
                    pdf.text(questionLines, 20, yPosition);
                    yPosition += questionLines.length * 5;
                    
                    // Response
                    pdf.setTextColor(102, 126, 234);
                    pdf.text(responseText, 25, yPosition);
                    pdf.setTextColor(0, 0, 0);
                    yPosition += 10;
                });
                
                yPosition += 10;
            });
            
            // Add comparison summary
            if (yPosition > 220) {
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(16);
            pdf.setTextColor(102, 126, 234);
            pdf.text('Resumo Comparativo', 20, yPosition);
            yPosition += 15;
            
            let agreements = 0;
            let totalQuestions = this.questions.length;
            
            if (this.responses.person1 && this.responses.person2) {
                for (let i = 1; i <= totalQuestions; i++) {
                    const answer1 = this.responses.person1.answers[i]?.value;
                    const answer2 = this.responses.person2.answers[i]?.value;
                    if (answer1 === answer2) {
                        agreements++;
                    }
                }
            }
            
            const agreementPercentage = Math.round((agreements / totalQuestions) * 100);
            
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Respostas Iguais: ${agreements}`, 20, yPosition);
            yPosition += 10;
            pdf.text(`Respostas Diferentes: ${totalQuestions - agreements}`, 20, yPosition);
            yPosition += 10;
            pdf.text(`Percentual de Concordância: ${agreementPercentage}%`, 20, yPosition);
            
            // Save PDF
            const fileName = `escala-conjugal-${this.responses.person1.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.pdf`;
            pdf.save(fileName);
            
            this.showAlert('PDF gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showAlert('Erro ao gerar PDF. Tente novamente.', 'error');
        } finally {
            this.hideModal();
        }
    }
    
    resetEvaluation() {
        if (confirm('Tem certeza que deseja iniciar uma nova avaliação? Os dados atuais serão perdidos.')) {
            this.currentPerson = 1;
            this.responses = { person1: null, person2: null };
            
            // Reset form
            document.getElementById('evaluationForm').reset();
            document.getElementById('formTitle').textContent = 'Primeira Pessoa - Dados Pessoais';
            document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Respostas';
            
            // Clear radio selections
            document.querySelectorAll('.radio-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Show form section
            document.getElementById('formSection').classList.add('active');
            document.getElementById('resultsSection').classList.remove('active');
            
            // Reset progress
            this.updateProgress();
        }
    }
    
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease;
        `;
        
        if (type === 'success') {
            alert.style.background = 'linear-gradient(135deg, #4ecdc4, #44a08d)';
        } else if (type === 'error') {
            alert.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        } else {
            alert.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }
        
        alert.textContent = message;
        document.body.appendChild(alert);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new EscalaConjugal();
});