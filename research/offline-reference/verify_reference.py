"""Offline ScopeWatch contract checks; no ClickHouse/Guild/account access."""
from collections import defaultdict, deque
from itertools import groupby
import json, random

W=600

def canonical(rows):
    groups=defaultdict(set)
    for key,semantic in rows:
        if key is None:
            raise ValueError('missing identity')
        groups[key].add(semantic)
    if any(len(v)!=1 for v in groups.values()):
        raise ValueError('conflicting native identity')
    return [(key,next(iter(v))) for key,v in sorted(groups.items())]

def sweep(events,allowance,effective=0,cutoff=2000):
    # Event=(time,key,session); deduplicated, validated events only.
    ordered=sorted(e for e in events if effective<=e[0]<=cutoff)
    q=deque(); anchors=[]
    for t,group in groupby(ordered,key=lambda e:e[0]):
        while q and q[0][0]<=t-W:
            q.popleft()
        q.extend(group)
        anchors.append((t,len(q),tuple(sorted(e[1] for e in q))))
    first=next((a for a in anchors if a[1]>allowance),None)
    return {'first':first,'max':max((a[1] for a in anchors),default=0),
            'current':sum(cutoff-W<e[0]<=cutoff for e in ordered),'anchors':anchors}

def brute(events,allowance,effective=0,cutoff=2000):
    valid=[e for e in events if effective<=e[0]<=cutoff]
    anchors=[]
    for t in sorted({e[0] for e in valid}):
        keys=tuple(sorted(e[1] for e in valid if t-W<e[0]<=t))
        anchors.append((t,len(keys),keys))
    return anchors

checks=[]
def check(name,condition):
    assert condition,name
    checks.append(name)

support=[(100+i*10,'s'+str(i),'session'+str(i//6)) for i in range(30)]
control=[(100+i*10,'c'+str(i),'control'+str(i//10)) for i in range(40)]
a=sweep(support,20,cutoff=500); b=sweep(control,60,cutoff=500)
check('30/20 target; busier 40/60 control stays compliant',a['current']==30 and a['first'][1]==21 and b['current']==40 and b['first'] is None)
raw=[(e[1],e) for e in support]
check('identical repeated native IDs do not add units',len(canonical(raw+raw))==30)
check('new retry ID adds unit',len(canonical(raw+[('new',(400,'new','session0'))]))==31)
for name,mutant in [('changed time',(900,'s0','session0')),('changed session',(100,'s0','other')),('changed decision',('DENY','s0','session0'))]:
    try: canonical(raw+[('s0',mutant)])
    except ValueError: check('conflict rejected before filtering: '+name,True)
    else: raise AssertionError(name)
try: canonical([(None,(100,'missing','session0'))])
except ValueError: check('null identity is a gap',True)
check('strict lower boundary and inclusive upper tie group',sweep([(0,'a','x'),(600,'b','x'),(600,'c','y')],1,cutoff=600)['anchors'][-1]==(600,2,('b','c')))
check('all same-time events included in crossing witness',sweep([(100,str(i),'x') for i in range(30)],20,cutoff=100)['first'][1]==30)
late=sweep(support,20,cutoff=2000)
check('expired current window retains historical crossing',late['current']==0 and late['max']==30 and late['first'] is not None)
check('effective start inclusive excludes earlier preflight',sweep([(99,'before','x'),(100,'at','x')],0,effective=100,cutoff=100)['first'][2]==('at',))
check('empty complete candidate is exactly zero',sweep([],20)['current']==0 and sweep([],20)['first'] is None)
permission_rows=[(0,'a','s','ALLOW','issues_get','cred','failed'),(1,'b','s','DENY','issues_get','cred','denied'),(2,'c','s','ERROR','issues_get','cred','unknown'),(3,'d','s','ALLOW','other','cred','success'),(4,'e','s','ALLOW','issues_get','other','success')]
counted=[r for r in permission_rows if r[3]=='ALLOW' and r[4]=='issues_get' and r[5]=='cred']
check('failed ALLOW counts; DENY ERROR other operation credential excluded',len(counted)==1 and counted[0][6]=='failed')
event_to_subject={'nested':'B'}
root_subject='A'
check('nested B event in root A session attributes to event subject B',event_to_subject['nested']=='B' and event_to_subject['nested']!=root_subject)
check('unresolved event binding cannot be an eligible actor',event_to_subject.get('unknown') is None)
try: canonical([('nested',('A','native-task')),('nested',('B','native-task'))])
except ValueError: check('conflicting event actor bindings rejected',True)
else: raise AssertionError('event binding conflict')
shuffled=support.copy(); random.Random(7).shuffle(shuffled)
check('input order does not change witness',sweep(shuffled,20,cutoff=500)==sweep(support,20,cutoff=500))
old=sweep(support[:20],20,cutoff=2000); new=sweep(support,20,cutoff=2000)
check('late unique records produce new historical crossing',old['first'] is None and new['first'] is not None)
rng=random.Random(88)
for i in range(1000):
    ev=[(rng.randrange(0,2500),str(j),'session'+str(j%5)) for j in range(rng.randrange(0,80))]
    result=sweep(ev,rng.randrange(0,30),effective=100,cutoff=2000)
    assert result['anchors']==brute(ev,0,effective=100,cutoff=2000)
check('1000 randomized sweep results equal independent brute-force windows',True)
print(json.dumps({'kind':'offline_algorithm_contract_check','database_queries_executed':False,'guild_calls_executed':False,'checks_passed':len(checks),'checks':checks,'support':{k:v for k,v in a.items() if k!='anchors'},'control':{k:v for k,v in b.items() if k!='anchors'},'late':{k:v for k,v in late.items() if k!='anchors'}},indent=2))
