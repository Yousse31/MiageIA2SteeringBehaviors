class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 10;
    this.maxForce = 0.6;
    this.r = 16;
    this.rayonZoneDeFreinage = 100;
    this.isScattering = false;
    this.scatterTimer = 0;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target, d = 0) {
    return this.seek(target, true, d);
  }

  flee(target) {
    // recopier code de flee de l'exemple précédent
  }

  seek(target, arrival = false, d) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;

    if (arrival) {
      if (Vehicle.debug) {
        stroke(255, 255, 255);
        noFill();
        circle(target.x, target.y, this.rayonZoneDeFreinage);
      }

      let distance = p5.Vector.dist(this.pos, target);

      if (distance < this.rayonZoneDeFreinage) {
        desiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  orbit(center, radius, angleOffset) {
    let angle = frameCount * 0.02 + angleOffset;
    let target = createVector(
      center.x + radius * cos(angle),
      center.y + radius * sin(angle)
    );
    return this.arrive(target);
  }

  scatter() {
    this.isScattering = true;
    this.scatterTimer = 120; // 2 seconds at 60 FPS
    let scatterForce = p5.Vector.random2D();
    scatterForce.setMag(this.maxSpeed);
    this.applyForce(scatterForce);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (this.isScattering) {
      this.scatterTimer--;
      if (this.scatterTimer <= 0) {
        this.isScattering = false;
      }
    }
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill(255);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
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
}

class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill("#F063A4");
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }
}