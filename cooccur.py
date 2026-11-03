from collections import defaultdict
from itertools import combinations
from statistics import mean
import matplotlib.pyplot as plt

NUM_TOPICS = 80
'''
Read doc-topics.txt and get dict of filename : distributions
'''
doc_topics = "all_segments_MALLET/doc-topics.txt"
doc_distribs = {}
with open(doc_topics) as f:
    for line in f:
        parts = line.strip().split("\t")
        file = parts[1].split("/")[-1][:-4]
        topic_distributions = parts[2:]
        doc_distribs[file] = topic_distributions

# Get number of segments where each topic is active
active_files = [[]] * 80
for segment in list(doc_distribs.keys()):
    prevalences = doc_distribs[segment]
    for i, p in enumerate(prevalences):
        if float(p) > .09:
            if len(active_files[i]) > 0:
                active_files[i].append(segment)
            else:
                active_files[i] = [segment]

cooccurs = []
for t, file_list in enumerate(active_files):
    cooccurs_t= ""
    den = len(file_list)
    for o, other_file_list in enumerate(active_files):
        inCommon = len(list(set(file_list) & set(other_file_list)))
        rate = inCommon / den * 100
        if rate > 5 and o != t:
            cooccurs_t += str(o) + " "
    #print(cooccurs_t)
    cooccurs.append(cooccurs_t.strip() + '\n')

print(cooccurs)
with open("cooccur.txt", "w") as file:
    file.writelines(cooccurs)

# print(len(active_files[0]))
# print(len(active_files[1]))
# print(len(active_files[4]))


'''
TOPIC 8: 

'''

