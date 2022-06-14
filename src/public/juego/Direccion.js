class Direccion {

    constructor(i, sumarX, sumarY) {
        this.i = i;
        this.sumarX = sumarX;
        this.sumarY = sumarY;
    }

    getI() {
        return this.i;
    }

    getSumarX() {
        return this.sumarX;
    }

    getSumarY() {
        return this.sumarY;
    }

}

export default [
    new Direccion(0, 0, 1),
    new Direccion(1, 0, -1),
    new Direccion(2, -1, 0),
    new Direccion(3, 1, 0)
];