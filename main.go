package main

import "github.com/mstr-mnd/north/router"

func main() {
	r := router.NewRouter()

	err := r.Run(":8080")
	if err != nil {
		panic("failed start server")
	}
}
