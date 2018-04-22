"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const entity_1 = require("./games/entity");
const class_validator_1 = require("class-validator");
let MainController = class MainController {
    constructor() {
        this.validator = new class_validator_1.Validator();
        this.colors = ["red", "blue", "green", "yellow", "magenta"];
        this.rand = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.defaultBoard = JSON.parse(JSON.stringify("[['o', 'o', 'o'],['o', 'o', 'o'],['o', 'o', 'o']]"));
    }
    async allGames() {
        const games = await entity_1.default.find();
        return { games };
    }
    createGame(game) {
        game["color"] = this.rand;
        game["board"] = this.defaultBoard;
        return game.save();
    }
    async updateGame(id, update) {
        const game = await entity_1.default.findOne(id);
        let previousBoard = game["board"];
        if (Object.keys(update).includes('color')) {
            if (this.validator.isNotIn((update.color), (this.colors))) {
                throw new routing_controllers_1.NotAcceptableError('invalid color');
            }
            else {
                if (Object.keys(update).includes('board')) {
                    let currentBoard = update.board;
                    let moves = this.getMoves(previousBoard, currentBoard);
                    if (moves > 1)
                        return new routing_controllers_1.BadRequestError('Invalid Move');
                }
            }
        }
        if (!game)
            throw new routing_controllers_1.NotFoundError('Cannot find game');
        return entity_1.default.merge(game, update).save();
    }
    getMoves(previousBoard, currentBoard) {
        let slicedPrevBoard = previousBoard.slice(1, -1).replace("]", "] ").split(" ");
        let slicedCurrBoard = currentBoard.slice(1, -1).replace("]", "] ").split(" ");
        let strPrevBoard = "";
        let strCurrBoard = "";
        slicedPrevBoard.map((row, y) => {
            let newrow = row.replace(/"|'|\[|\]/gi, "");
            strPrevBoard = strPrevBoard.concat(newrow);
        });
        slicedCurrBoard.map((row, y) => {
            let newrow = row.replace(/"|'|\[|\]/gi, "");
            strCurrBoard = strCurrBoard.concat(newrow);
        });
        let moves = 0;
        let currBoard = strCurrBoard.split(',');
        let prevBoard = strPrevBoard.split(',');
        console.log(currBoard);
        console.log(prevBoard);
        currBoard.map((element, index) => {
            if (element != prevBoard[index]) {
                moves = moves + 1;
            }
        });
        console.log(moves);
        return moves;
    }
};
__decorate([
    routing_controllers_1.Get('/games'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MainController.prototype, "allGames", null);
__decorate([
    routing_controllers_1.Post('/games'),
    routing_controllers_1.HttpCode(201),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entity_1.default]),
    __metadata("design:returntype", void 0)
], MainController.prototype, "createGame", null);
__decorate([
    routing_controllers_1.Put('/games/:id'),
    __param(0, routing_controllers_1.Param('id')),
    __param(1, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MainController.prototype, "updateGame", null);
MainController = __decorate([
    routing_controllers_1.Controller()
], MainController);
exports.default = MainController;
//# sourceMappingURL=controller.js.map