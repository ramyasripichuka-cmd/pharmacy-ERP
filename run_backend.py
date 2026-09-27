import uvicorn

if __name__ == "__main__":
    print("Starting LifeCare Pharmacy ERP Backend on http://localhost:8000...")
    print("Interactive Swagger Documentation: http://localhost:8000/docs")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
