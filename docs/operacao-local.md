# Operação no Windows

[Voltar ao README](../README.md)

## Pré-requisitos

- A pasta local do Monitor-Botafogo com `monitor.py`, `painel.html`, os scripts PowerShell e a pasta `sql/`.
- Python com `psycopg` e acesso a um PostgreSQL. A instalação original foi validada com Python 3.12 e PostgreSQL 18.
- PowerShell 7 e Agendador de Tarefas do Windows para usar os scripts de inicialização e agendamento.
- Conexão de internet para consultar a loja. O histórico já armazenado pode ser consultado localmente com o PostgreSQL e o painel em execução.

## Usar a instalação existente

Execute os comandos na pasta local do monitor. Em uma sessão Windows que já tem a tarefa do painel em execução, abra direto o [Radar no Chrome](http://127.0.0.1:8765/).

| Operação | Comando |
| --- | --- |
| Abrir o painel | `pwsh -NoProfile -File .\Iniciar.ps1` |
| Coletar imediatamente | `pwsh -NoProfile -File .\Iniciar.ps1 -Once -NoBrowser` |
| Aplicar migrações pendentes | `pwsh -NoProfile -File .\Iniciar.ps1 -Migrate -NoBrowser` |
| Registrar as tarefas do Windows | `pwsh -NoProfile -File .\Registrar-Agendamento.ps1` |

O launcher da instalação original usa a infraestrutura PostgreSQL local do projeto Tributário e uma credencial protegida pelo Windows (DPAPI). Essa credencial pertence à conta Windows que a configurou. Para outra instalação, use a execução direta abaixo ou adapte o launcher aos caminhos e ao método de autenticação da máquina.

O parâmetro `-Port` permite usar outra porta no launcher ou ao registrar a tarefa do painel. Abra a porta escolhida no navegador.

## Configurar outra instalação

Com os arquivos do monitor presentes, instale `psycopg` no ambiente Python. Crie um banco e uma conta PostgreSQL para o monitor. A conta que executa a inicialização precisa ter permissões para criar ou migrar os objetos do schema `botafogo`.

```powershell
python -m pip install "psycopg[binary]"
$env:PGHOST = '127.0.0.1'
$env:PGPORT = '5432'
$env:PGDATABASE = 'projetos'
$env:PGUSER = 'usuario_do_monitor'
python monitor.py --migrate --no-browser
python monitor.py --once --no-browser
python monitor.py --no-browser
```

Use um arquivo de senha do PostgreSQL ou forneça `PGPASSWORD` no ambiente do processo. Mantenha as credenciais fora do repositório. O Python usa `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` e a configuração de senha do libpq. O servidor escuta apenas em `127.0.0.1`.

## Verificar o agendamento

```powershell
Get-ScheduledTask -TaskName 'Botafogo Monitor - *' |
    Select-Object TaskName, State, @{n='Intervalo'; e={$_.Triggers.Repetition.Interval}}

Get-ScheduledTaskInfo -TaskName 'Botafogo Monitor - Coleta' |
    Select-Object LastRunTime, NextRunTime, LastTaskResult, NumberOfMissedRuns
```

A tarefa **Botafogo Monitor - Coleta** tem intervalo `PT2H`. A tarefa **Botafogo Monitor - Painel** inicia no logon. A coleta roda com o navegador fechado. A máquina precisa estar ligada e a conta Windows usada nas tarefas precisa estar conectada. Bloquear a tela mantém a sessão ativa.

Para testar a tarefa registrada, execute `Start-ScheduledTask -TaskName 'Botafogo Monitor - Coleta'` e confira se surgiu uma rodada com `source = 'scheduled'`. O código de saída `0` também pode indicar coleta parcial ou uma execução ignorada por concorrência. Use o registro da rodada para confirmar o resultado.

```sql
SELECT id, at, finished_at, source, status, products, coverage, failures
FROM botafogo.runs
ORDER BY id DESC
LIMIT 20;
```

## Diagnóstico e testes

| Sintoma | Como conferir |
| --- | --- |
| Chrome não abre o painel | Confira se a tarefa do painel está em execução e se o Chrome está na mesma máquina. Consulte a porta configurada. |
| Falha na conexão com o PostgreSQL | Confira se o banco está ligado e se banco, usuário e credencial correspondem à instalação. Em caso de DPAPI, confira a conta Windows da tarefa. |
| Coleta parcial | Abra os detalhes da coleta no painel ou consulte `coverage` e `failures` em `botafogo.runs`. |
| Coleta já em andamento | Aguarde a rodada ativa. O botão e a tarefa compartilham o bloqueio do PostgreSQL. |
| Preços parecem antigos | Confira a hora da observação e o estado da última rodada. Uma oferta pode ter ficado fora da cobertura. |

Execute `python -m unittest -v test_monitor` com o Python da instalação. Os testes cobrem divisão de páginas, valores monetários, classificação de quedas, alterações apenas na referência, indisponibilidade e reposição. Para validar a instalação, confirme também o painel, a rodada automática e o histórico de uma variação que apareceu em duas coletas.
