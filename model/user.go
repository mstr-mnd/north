package model

import (
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type User struct {
	ID         string `json:"id" bson:"_id"`
	Name       string `json:"name" binding:"required" bson:"name"`
	Email      string `json:"email" binding:"required,email" bson:"email"`
	Subscribed bool   `json:"subscribed" bson:"subscribed"`
}

func NewUser(name string, email string) (*User, error) {
	id, err := gonanoid.New(10)
	if err != nil {
		return nil, err
	}
	return &User{
		ID:    "user_" + id,
		Name:  name,
		Email: email,
	}, nil
}
