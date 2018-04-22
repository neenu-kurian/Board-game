import {Controller, Get,Post,HttpCode,Body,NotFoundError,Param,Put, NotAcceptableError, BadRequestError} from 'routing-controllers'
import Game from './games/entity'
import {Validator} from "class-validator";


@Controller()
export default class MainController {
    validator = new Validator();

    colors=["red", "blue", "green", "yellow", "magenta"]
    
    //to get random colors
    rand = this.colors[Math.floor(Math.random() * this.colors.length)];
    //creating default board of type JSON
    defaultBoard = JSON.parse(JSON.stringify("[['o', 'o', 'o'],['o', 'o', 'o'],['o', 'o', 'o']]"))
    
    //to get all games 
    @Get('/games')
    async allGames() 
    {
      const games = await Game.find()
      return { games }
    }

    //to create a new game
    @Post('/games')
    @HttpCode(201)
    createGame(
    @Body() game: Game
    ) 
    {
      game["color"]=this.rand
      game["board"]=this.defaultBoard
     
      return game.save()
   }


   //to update an existing game
   @Put('/games/:id')
   async updateGame(
   @Param('id') id: number,
   @Body() update: Partial<Game>
   ) 
   {
     const game = await Game.findOne(id)
     let previousBoard = game["board"]
     
     //checking if the body of request has color 
     if(Object.keys(update).includes('color'))
     {   
         //validating if color is in list of random colors
         if(this.validator.isNotIn((update.color),(this.colors)))
         {  
              throw new NotAcceptableError('invalid color')
         }
   
         else {
              //checking number of moves
               if(Object.keys(update).includes('board'))
               {
                   let currentBoard=update.board
                   let moves=this.getMoves(previousBoard,currentBoard)
                   
                   if(moves>1)
                    return new BadRequestError('Invalid Move')
               }
            }
     }
     
     if (!game) throw new NotFoundError('Cannot find game')
     
     return Game.merge(game, update).save()
   }

  //function that takes last board and current board entered by user as parameter and returns no of moves
  getMoves(previousBoard,currentBoard)
  {
     let slicedPrevBoard=previousBoard.slice(1,-1).replace("]","] ").split(" ")
     let slicedCurrBoard=currentBoard.slice(1,-1).replace("]","] ").split(" ")
     let strPrevBoard=""
     let strCurrBoard=""
    
     slicedPrevBoard.map((row, y) => {
         let newrow=row.replace(/"|'|\[|\]/gi,"") 
         strPrevBoard=strPrevBoard.concat(newrow)
     })
 
     slicedCurrBoard.map((row, y) => {
         let newrow=row.replace(/"|'|\[|\]/gi,"") 
         strCurrBoard=strCurrBoard.concat(newrow)
     })
     let moves=0
    
 
     let currBoard=strCurrBoard.split(',')
     let prevBoard=strPrevBoard.split(',')
 
     console.log(currBoard)
     console.log(prevBoard)
 
     currBoard.map((element,index)=>{
     if(element!=prevBoard[index]){
         moves=moves+1
     }})
 
     console.log(moves)
     return moves
  }

}