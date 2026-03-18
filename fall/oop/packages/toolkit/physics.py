# physics.py - Basic physics formulas

GRAVITY = 9.81  # m/s^2

def force(mass, acceleration):
    """Calculate force: F = m * a"""
    return mass * acceleration

def weight(mass):
    """Calculate weight on Earth: W = m * g"""
    return mass * GRAVITY

def kinetic_energy(mass, velocity):
    """Calculate kinetic energy: KE = 0.5 * m * v^2"""
    return 0.5 * mass * velocity ** 2
