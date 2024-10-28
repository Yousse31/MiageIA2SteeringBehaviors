let vehicles = [];

function setup() {
  createCanvas(800, 800);
  createVehicles(10);
}

function createVehicles(nbVehicles) {
  for (let i = 0; i < nbVehicles; i++) {
    let x = random(width);
    let y = random(height);
    vehicles.push(new Vehicle(x, y));
  }
}

function draw() {
  background(0);

  let target = createVector(mouseX, mouseY);
  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);

  let radius = 100; // Rayon du cercle
  vehicles.forEach((vehicle, index) => {
    if (!vehicle.isScattering) {
      let angleOffset = (TWO_PI / vehicles.length) * index;
      let steering = vehicle.orbit(target, radius, angleOffset);
      vehicle.applyForce(steering);
    }
    vehicle.update();
    vehicle.show();
  });
}

function mousePressed() {
  if (mouseButton === LEFT) {
    vehicles.forEach(vehicle => vehicle.scatter());
  }
}

function keyPressed() {
  if (key === 'd') {
    Vehicle.debug = !Vehicle.debug;
  }
}