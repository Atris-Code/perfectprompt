
try:
    print("Importing fastapi...")
    import fastapi
    print("Importing sqlalchemy...")
    import sqlalchemy
    print("Importing google.generativeai...")
    import google.generativeai
    print("Importing database...")
    import database
    print("Importing models...")
    import models
    print("Importing schemas...")
    import schemas
    print("Importing security...")
    import security
    print("Importing dependencies...")
    import dependencies
    print("Importing nexo_brain...")
    import nexo_brain
    print("Importing audit...")
    import audit
    print("Importing ai_service...")
    import ai_service
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
    import traceback
    traceback.print_exc()
