"""
Métricas Prometheus de auditoría y negocio para Nexo Sinérgico.

Estas métricas se exponen en el endpoint /metrics junto a las métricas HTTP
automáticas de prometheus_fastapi_instrumentator. Se consumen desde Grafana
(docker-compose.monitoring.yml).

Convención de nombres: prefijo `nexo_` y sufijo `_total` para contadores.
"""
import time
from functools import wraps

from prometheus_client import Counter, Gauge, Histogram

# --- Autenticación y sesiones ---
LOGIN_ATTEMPTS = Counter(
    'nexo_login_attempts_total',
    'Intentos de inicio de sesión',
    ['provider'],  # 'credentials' | 'google'
)
LOGIN_FAILURES = Counter(
    'nexo_login_failures_total',
    'Inicios de sesión fallidos',
    ['provider'],
)
LOGIN_SUCCESS = Counter(
    'nexo_login_success_total',
    'Inicios de sesión exitosos',
    ['provider'],
)
REFRESH_TOTAL = Counter(
    'nexo_refresh_total',
    'Intercambios de refresh token',
    ['status'],  # 'ok' | 'error'
)
LOGOUT_TOTAL = Counter(
    'nexo_logout_total',
    'Cierres de sesión (revocación de refresh token)',
)
ACTIVE_SESSIONS = Gauge(
    'nexo_active_sessions',
    'Sesiones activas (refresh tokens no expirados)',
)

# --- Proxy de IA ---
AI_REQUESTS = Counter(
    'nexo_ai_requests_total',
    'Peticiones al proxy de IA',
    ['endpoint'],  # text | json | chat | image | speech | vision
)
AI_ERRORS = Counter(
    'nexo_ai_errors_total',
    'Errores del proxy de IA',
    ['endpoint'],
)
AI_LATENCY = Histogram(
    'nexo_ai_latency_seconds',
    'Latencia del proxy de IA (segundos)',
    ['endpoint'],
)

# --- CFO Project Finance ---
CFO_SIMULATIONS = Counter(
    'nexo_cfo_simulations_total',
    'Simulaciones Project Finance CFO',
    ['scenario'],  # biochar | chp | custom
)
CFO_OPTIMIZE = Counter(
    'nexo_cfo_optimize_total',
    'Optimizaciones de capacidad eléctrica (optimize-pe)',
)
CFO_MEMO_EXPORTS = Counter(
    'nexo_cfo_memo_exports_total',
    'Exportaciones de memorando de inversión',
)

# --- Auditoría (eventos de negocio) ---
AUDIT_EVENTS = Counter(
    'nexo_audit_events_total',
    'Eventos de auditoría por tipo de acción',
    ['action_type'],  # LOGIN, LOGIN_GOOGLE, CREATE_USER, ...
)


def track_ai(endpoint: str):
    """
    Decorador que registra peticiones, errores y latencia de un endpoint IA.

    Uso:
        @router.post('/text')
        @track_ai('text')
        def ai_text(...): ...
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            AI_REQUESTS.labels(endpoint=endpoint).inc()
            start = time.perf_counter()
            try:
                return fn(*args, **kwargs)
            except Exception:
                AI_ERRORS.labels(endpoint=endpoint).inc()
                raise
            finally:
                AI_LATENCY.labels(endpoint=endpoint).observe(
                    time.perf_counter() - start
                )

        return wrapper

    return decorator
