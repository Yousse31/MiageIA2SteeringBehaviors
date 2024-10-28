class Vehicle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(1, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.r = 16;

    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = PI / 2;
    this.displaceRange = 0.3;

    this.path = [];
    this.visionAngle = PI / 4; // Angle de vision
    this.visionDistance = 200; // Distance de vision
    this.state = 'wander'; // État initial
    this.stateTimer = 0; // Timer pour l'état
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let distance = desired.mag();
    let speed = this.maxSpeed;
    if (distance < 50) { // Réduire la zone de freinage
      speed = map(distance, 0, 50, 3, this.maxSpeed); // Augmenter la vitesse minimale
    }
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  flee(target) {
    let desired = p5.Vector.sub(this.pos, target);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  inSight(target, visionAngle = PI / 4, visionDistance = 200) {
    let distance = p5.Vector.dist(this.pos, target.pos);
    if (distance > visionDistance) {
      return false;
    }

    let direction = p5.Vector.sub(target.pos, this.pos);
    let angle = p5.Vector.angleBetween(this.vel, direction);

    return angle < visionAngle / 2;
  }

  reachTarget(target) {
    let distance = p5.Vector.dist(this.pos, target.pos);
    if (distance < this.r * 2) { // Augmenter le rayon de détection pour atteindre la proie
      return true;
    }
    return false;
  }

  wander() {
    // point devant le véhicule
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(this.distanceCercle);
    wanderPoint.add(this.pos);

    // Calculer le point vert SUR LE CERCLE
    let theta = this.wanderTheta + this.vel.heading();
    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);

    // maintenant wanderPoint c'est un point sur le cercle
    wanderPoint.add(x, y);

    // Calculer le vecteur desiredSpeed
    let steer = wanderPoint.sub(this.pos);
    steer.setMag(this.maxForce);
    this.applyForce(steer);

    // Déplacer le point vert sur le cercle (en radians)
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // Ajouter la position courante dans le tableau du chemin
    this.path.push(this.pos.copy());

    // Si le tableau a plus de 50 éléments, supprimer le plus ancien
    if (this.path.length > 50) {
      this.path.shift();
    }

    // Gestion du timer d'état
    if (this.stateTimer > 0) {
      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.state = 'wander';
      }
    }
  }

  show() {
    if (this.disappeared) return; // Ne rien dessiner si la proie est disparue

    // Dessin du chemin
    this.path.forEach((p, index) => {
      if (!(index % 3)) {
        stroke(255);
        fill(255);
        circle(p.x, p.y, 1);
      }
    });

    // Dessin du véhicule
    stroke(255);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    imageMode(CENTER);
    scale(-1, 1); // Inverser l'axe horizontal
    if (this instanceof Predator) {
      image(predatorImage, 0, 0, this.r * 2, this.r * 2); // Afficher l'image du prédateur
    } else {
      image(preyImage, 0, 0, this.r * 2, this.r * 2); // Afficher l'image de la proie
    }
    pop();
  }

  showVisionCone() {
    if (this.disappeared) return; // Ne pas afficher le cône de vision si la proie est disparue

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noFill();
    if (this.state === 'hunt') {
      stroke(255, 0, 0, 200); // Rouge pour le prédateur en chasse
    } else if (this.state === 'flee') {
      stroke(0, 0, 255, 200); // Bleu pour la proie en fuite
    } else if (this.state === 'reproduce') {
      stroke(255, 0, 255, 200); // Rose pour la reproduction
    } else {
      stroke(255, 255, 0, 200); // Jaune par défaut
    }
    arc(0, 0, this.visionDistance * 2, this.visionDistance * 2, -this.visionAngle / 2, this.visionAngle / 2);
    pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  stop() {
    this.vel.set(0, 0);
    this.acc.set(0, 0);
  }

  turnTowards(target) {
    let desired = p5.Vector.sub(target.pos, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }
}

class Predator extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.r = 24; // Plus gros pour les prédateurs
    this.maxSpeed = 6; // Plus rapide pour les prédateurs
    this.maxForce = 0.5; // Plus de force pour les prédateurs
    this.visionDistance = 300; // Augmenter la distance de vision pour les prédateurs
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let distance = desired.mag();
    let speed = this.maxSpeed;
    if (distance < 50) { // Réduire la zone de freinage
      speed = map(distance, 0, 50, 3, this.maxSpeed); // Augmenter la vitesse minimale
    }
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  hunt(preys) {
    for (let i = preys.length - 1; i >= 0; i--) {
      let prey = preys[i];
      if (this.inSight(prey)) {
        let steering = this.arrive(prey.pos);
        this.applyForce(steering);
        this.state = 'hunt';
        this.stateTimer = 120; // 2 secondes à 60 FPS
        if (this.reachTarget(prey)) {
          // La proie est touchée, vous pouvez ajouter une action ici, par exemple :
          prey.disappear(); // Marquer la proie comme disparue
          prey.reproducing = false; // Annuler la reproduction si la proie est touchée
          preys.splice(i, 1); // Retirer la proie de la liste
        }
        return;
      }
    }
    this.wander();
  }
}

class Prey extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.disappeared = false;
    this.reproducing = false;
  }

  disappear() {
    this.disappeared = true;
  }

  respawn() {
    this.pos = createVector(random(width), random(height));
    this.disappeared = false;
  }

  reproduce(preys) {
    if (this.reproducing) return;

    for (let otherPrey of preys) {
      if (otherPrey !== this && this.inSight(otherPrey)) {
        let steering = this.arrive(otherPrey.pos);
        this.applyForce(steering);
        if (this.reachTarget(otherPrey) && preys.length < 10) {
          this.reproducing = true;
          otherPrey.reproducing = true;
          this.stop();
          otherPrey.stop();
          otherPrey.turnTowards(this);
          this.state = 'reproduce';
          otherPrey.state = 'reproduce';
          setTimeout(() => {
            if (!this.disappeared && !otherPrey.disappeared) {
              preys.push(new Prey(random(width), random(height)));
            }
            this.reproducing = false;
            otherPrey.reproducing = false;
            this.state = 'wander';
            otherPrey.state = 'wander';
          }, 2000); // Arrêter pendant 2 secondes
        }
        return;
      }
    }
  }

  fleeFrom(predators) {
    for (let predator of predators) {
      if (this.inSight(predator)) {
        this.reproducing = false; // Annuler la reproduction si un prédateur est détecté
        this.state = 'flee';
        let steering = this.flee(predator.pos);
        this.applyForce(steering);
        this.stateTimer = 120; // 2 secondes à 60 FPS
        return;
      }
    }
    this.wander();
  }

  show() {
    if (!this.disappeared) {
      super.show();
    }
  }
}