package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mstr-mnd/north/model"
)

func NewRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/ping", pingHandler)
	r.POST("/user", createUser)

	return r
}
func pingHandler(ctx *gin.Context) {
	ctx.JSON(200, gin.H{"message": "pong"})
}
func createUser(ctx *gin.Context) {
	var input model.User

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := model.NewUser(input.Name, input.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate ID"})
		return
	}

	id.Name = input.Name
	id.Email = input.Email

	ctx.JSON(http.StatusCreated, id)
}
