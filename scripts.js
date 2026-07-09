// Gallery logic
        function changeImage(element, imageUrl) {
            document.querySelectorAll('.gallery__thumb').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
            document.getElementById('mainImage').innerHTML = '<img src="' + imageUrl + '" alt="Product Photo" style="width: 100%; height: auto; display: block; border-radius: inherit;">';
        }

        // Selection logic
        let selectedColor = 'Black';
        let selectedSize = 'S (40)';
        let selectedBundle = '2';

        function selectColor(element, color) {
            document.querySelectorAll('.swatch').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
            selectedColor = color;
            document.getElementById('colorLabel').innerHTML = `Color: <strong>${color}</strong>`;
        }

        function selectSize(element, size) {
            document.querySelectorAll('.size-btn').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
            selectedSize = size;
            document.getElementById('sizeLabel').innerHTML = `Size: <strong>${size}</strong>`;
        }

        function selectBundle(element, value) {
            document.querySelectorAll('.bundle-card').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
            element.querySelector('input[type="radio"]').checked = true;
            selectedBundle = value;
            
            // Optional: Update main price based on bundle
            const price = element.querySelector('.current-price').innerText;
            const btnBuy = document.querySelector('.btn-buy-now');
            btnBuy.innerHTML = `⚡ BUY NOW — ${price}`;
        }

        function addToCart(btn) {
            const originalText = btn.innerText;
            btn.innerHTML = "✓ ADDED!";
            btn.style.backgroundColor = "var(--rosa-escuro)";
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = "var(--rosa-principal)";
            }, 2000);
        }

        // FAQ logic
        function toggleFaq(element) {
            const parent = element.parentElement;
            const wasActive = parent.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
            
            if (!wasActive) {
                parent.classList.add('active');
            }
        }

        // Review filters
        document.querySelectorAll('.rev-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.rev-filter').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Scroll Animations (Intersection Observer)
        document.addEventListener("DOMContentLoaded", () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if(entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            elements.forEach(el => observer.observe(el));
        });
