let predators = [];
let preys = [];
let bgImage;
let predatorImage;
let preyImage;

function preload() {
  bgImage = loadImage('assets/pexels-blaque-x-264516-932638.jpg');
  predatorImage = loadImage('assets/Requin.png'); // Remplacer par le chemin de votre image de prédateur
  preyImage = loadImage('assets/poisson.png'); // Remplacer par le chemin de votre image de proie
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas prend toute la page
  const nbPredators = 1;
  for(let i = 0; i < nbPredators; i++) {
    let predator = new Predator(100, 100);
    predators.push(predator);
  }
  const nbPreys = 5;
  for(let i = 0; i < nbPreys; i++) {
    let prey = new Prey(random(width), random(height));
    preys.push(prey);
  }
}

function draw() {
  background(bgImage); // Utiliser bgImage pour l'image de fond
  predators.forEach(predator => {
    predator.hunt(preys);
    predator.update();
    predator.show();
    predator.showVisionCone(); // Afficher le cône de vision
    predator.edges();
  });
  preys.forEach(prey => {
    prey.fleeFrom(predators);
    prey.reproduce(preys);
    prey.update();
    prey.show();
    prey.showVisionCone(); // Afficher le cône de vision
    prey.edges();
  });

  // S'assurer qu'il y a toujours au moins 3 proies
  while (preys.length < 3) {
    preys.push(new Prey(random(width), random(height)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Redimensionner le canvas lorsque la fenêtre est redimensionnée
}